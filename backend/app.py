import json
import os
import subprocess
import pickle
import platform

import dotenv
import openai
import requests
from enum import Enum

from dotenv import load_dotenv
from re import findall, DOTALL

from flask import Flask, request
from flask_cors import cross_origin
from flask_socketio import SocketIO
from pydantic import BaseModel, Field
from openai import OpenAI

SINGLE_FILE_PROMPT = ("Analyse the code provided by the user, giving the response in a json, identifying all major, "
                      "moderate and code quality issues, giving a title, description and severity for each, noting the "
                      "issue type and line numbers where any issues are found. Also give the code a title.")
CODEBASE_PROMPT = ("Analyse the code in each of the files provided by the user, giving the response in a json, with "
                   "a section for each file including the filename and a list of all major, moderate and code "
                   "quality issues, giving a title, description and severity for each, noting the issue type and "
                   "line numbers where any issues are found. For each file, try to find at least 5 issues, with a "
                   "maximum of 50 for each. Do not return anything under any file where code is completely perfect and"
                   "clear of errors.")
UPDATE_PROMPT = ("Analyse the code in each of the files provided by the user, giving the response in a json, with "
                   "a section for each file including the filename and a list of all new major, moderate and code "
                   "quality issues, giving a title, description and severity for each, noting the issue type and "
                   "line numbers where any issues are found. A json list with all issues already found is below, "
                   "please mark each of these with isResolved as true if the issue has been resolved.")


class IssueType(str, Enum):
    majorIssue = "majorIssue"
    moderateIssue = "moderateIssue"
    codeQualityIssue = "codeQualityIssue"


class Issue(BaseModel):
    title: str = Field(description="Describe the issue in less than 5 words")
    description: str = Field(description="Describe the issue in less than 15 words")
    type: IssueType = Field(description="Categorise the issue as a major, moderate or code quality issue")
    severity: float = Field(description="Float between 0 and 1 indicating the severity of the code issue")
    lineNumbers: list[int] = Field(description="Give any line numbers where the issue is found")

class UpdatedIssue(BaseModel):
    title: str = Field(description="Describe the issue in less than 5 words")
    description: str = Field(description="Describe the issue in less than 15 words")
    type: IssueType = Field(description="Categorise the issue as a major, moderate or code quality issue")
    severity: float = Field(description="Float between 0 and 1 indicating the severity of the code issue")
    lineNumbers: list[int] = Field(description="Give any line numbers where the issue is found")
    isResolved: bool = Field(description="true if the issue has been resolved according to the code provided, else "
                                            "false")

class CodeAnalysis(BaseModel):
    codeTitle: str = Field(description="Give the code a title in less than 5 words describing the content.")
    issuesSummaryTitle: str = Field(description="Describe the status of the code considering the errors found in the "
                                                "form of a title in less than 8 words")
    issuesSummary: str = Field(description="Give summary of the issues found in the code in 20 words or less.")
    issues: list[Issue] = Field(description="A list of issues found in the code")


def analyse_code(client, model, prompt, code, response_format):
    completion = client.beta.chat.completions.parse(
        model=model,
        store=True,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": code}
        ],
        response_format=response_format,
    )
    return completion.choices[0].message.content


def analyse_single_file(client, code):
    return analyse_code(client, "gpt-4o", SINGLE_FILE_PROMPT, code, CodeAnalysis)


class PackException(Exception):
    pass


def get_directory_structure(packed_codebase):
    filepaths = findall("<file path=\"(.*)\">\n", packed_codebase)
    print(filepaths)
    return filepaths


def pack_codebase(command):

    # Run Repomix command using PowerShell on Windows, or Unix bash
    # Process output is printed to console
    if platform.system() == "Windows":
        print(subprocess.run(command, shell=True))
    else:
        print(subprocess.run(command))

    # Verify file is created, else throw error
    if not os.path.isfile('out.xml'):
        raise PackException("Packed codebase file not found")

    # If file has been successfully created, read contents
    file = open('out.xml', 'r')
    packed_codebase = file.read()

    # Get structure of filepaths within packed file
    directory_structure = get_directory_structure(packed_codebase)
    if not directory_structure:
        raise PackException("No files in specified directory")
    file.close()

    # Delete packed codebase
    if platform.system() == "Windows":
        os.remove(os.getcwd() + "\\out.xml")
    else:
        os.remove("out.xml")

    # Return packed file contents and directory structure
    return packed_codebase, directory_structure


def append_code_to_response(analysis_json, packed_codebase, directory_structure):
    for file in directory_structure:
        code = findall(f"<file path=\"{file}\">\n(.*?)\n</file>", packed_codebase, DOTALL) # GPT Assisted for matching
        for file_analysis in analysis_json["files"]:
            if file_analysis["filepath"][0] == file:
                code_lines = code[0].splitlines()
                for code_line_index in range(len(code_lines)):
                    code_lines[code_line_index] = code_lines[code_line_index][code_lines[code_line_index]
                                                                              .index(":") + 2:len(
                        code_lines[code_line_index])]
                file_analysis["code"] = "\n".join(code_lines)
    return analysis_json


def analyse_multiple_files(client, command):
    packed_codebase, directory_structure = pack_codebase(command)
    print(packed_codebase)
    print(directory_structure)

    class FileAnalysis(BaseModel):
        filepath: list[Enum("FilePath", {item: item for item in directory_structure})] = (
            Field(description="Filepath of the code in question"))  # ChatGPT generated `item: item for item`
        issues: list[Issue] = Field(description="List of code issues within the file at the given filepath")

    class CodebaseAnalysis(BaseModel):
        issuesSummaryTitle: str = Field(
            description="Describe the status of the code considering the errors found in the "
                        "form of a title in less than 8 words")
        issuesSummary: str = Field(description="Give summary of the issues found in the code in 20 words or less.")

        files: list[FileAnalysis]

    try:
        code_analysis = analyse_code(client, "gpt-4o", CODEBASE_PROMPT, packed_codebase, CodebaseAnalysis)
        analysis_json = json.loads(code_analysis)
        analysis_json["source"] = "GPT 4o"
        return append_code_to_response(analysis_json, packed_codebase, directory_structure)
    except openai.RateLimitError:
        code_analysis = analyse_code(client, "gpt-4o-mini", CODEBASE_PROMPT, packed_codebase, CodebaseAnalysis)
        analysis_json = json.loads(code_analysis)
        analysis_json["source"] = "GPT 4o mini"
        return append_code_to_response(analysis_json, packed_codebase, directory_structure)

def analyse_updated_files(cache, client, command):
    packed_codebase, directory_structure = pack_codebase(command)

    class FileAnalysis(BaseModel):
        filepath: list[Enum("FilePath", {item: item for item in directory_structure})] = (
            Field(description="Filepath of the code in question"))  # ChatGPT generated `item: item for item`
        issues: list[UpdatedIssue] = Field(description="List of code issues within the file at the given filepath")

    class CodebaseAnalysis(BaseModel):
        issuesSummaryTitle: str = Field(
            description="Describe the status of the code considering the errors found in the "
                        "form of a title in less than 8 words")
        issuesSummary: str = Field(description="Give summary of the issues found in the code in 20 words or less.")

        files: list[FileAnalysis]

    try:
        code_analysis = analyse_code(client, "gpt-4o", UPDATE_PROMPT + "\n```\n" + str(cache[len(cache)-1]) + "\n```", packed_codebase, CodebaseAnalysis)
        analysis_json = json.loads(code_analysis)
        analysis_json["source"] = "GPT 4o"
        return append_code_to_response(analysis_json, packed_codebase, directory_structure)
    except openai.RateLimitError:
        code_analysis = analyse_code(client, "gpt-4o-mini", UPDATE_PROMPT + "\n```\n" + str(cache[len(cache)-1]) + "\n```", packed_codebase, CodebaseAnalysis)
        analysis_json = json.loads(code_analysis)
        analysis_json["source"] = "GPT 4o mini"
        return append_code_to_response(analysis_json, packed_codebase, directory_structure)


def analyse_local_codebase(client, path):
    return analyse_multiple_files(client, ['npx', 'repomix', path, '--output', 'out.xml',
                                           '--output-show-line-numbers', '--no-security-check', '--style', 'xml',
                                           '--ignore', '**/*.svg,**/*.jpg,**/*.jpeg,**/*.png,**/.git,**/*.json,'
                                                       '**/*.txt,**/*.md,**/.gitignore,**/.env'])


def analyse_remote_codebase(client, url, project_number):
    json_analysis = analyse_multiple_files(client, ['npx', 'repomix', '--remote', url, '--output', 'out.xml',
                                                    '--output-show-line-numbers', '--no-security-check', '--style',
                                                    'xml', '--ignore', '**/*.svg,**/*.jpg,**/*.jpeg,**/*.png,**/.git,'
                                                                       '**/*.json,**/*.txt,**/*.md,**/.gitignore,**/.env'])
    session = requests.session()
    commits = session.get(
        "https://{}/api/v4/projects/{}/repository/commits?private_token={}&per_page=100&ref=main"
        .format(os.environ.get('GITLAB_DOMAIN'), project_number, os.environ.get("GITLAB_API_KEY")), timeout=5)
    json_analysis["commits"] = json.loads(commits.content)
    return json_analysis

def get_commits(project_number):
    session = requests.session()
    commits = session.get(
        "https://{}/api/v4/projects/{}/repository/commits?private_token={}&per_page=100&ref=main"
        .format(os.environ.get('GITLAB_DOMAIN'), project_number, os.environ.get("GITLAB_API_KEY")), timeout=5)
    return json.loads(commits.content)

def analyse_updated_remote_codebase(cache, client, url, project_number):
    json_analysis = analyse_updated_files(cache, client, ['npx', 'repomix', '--remote', url, '--output', 'out.xml',
                                                    '--output-show-line-numbers', '--no-security-check', '--style',
                                                    'xml', '--ignore', '**/*.svg,**/*.jpg,**/*.jpeg,**/*.png,**/.git,'
                                                                       '**/*.json,**/*.txt,**/*.md,**/.gitignore,**/.env'])
    json_analysis["commits"] = get_commits(project_number)
    return json_analysis


def check_openai(openai_api_key):
    if not openai_api_key:
        return False, "No key provided"
    if not openai_api_key.startswith("sk-"):
        return False, "Invalid key"
    return True, ""


def set_cache(source, name, json_content):
    pickle_db = open(f'pkl/{source}_{name}', 'ab')
    pickle.dump(json_content, pickle_db)
    pickle_db.close()

def update_cache(source, name, json_content):
    pickle_db = open(f'pkl/{source}_{name}', 'wb')
    pickle.dump(json_content, pickle_db)
    pickle_db.close()

def get_cache(source, name):
    try:
        pickle_db = open(f'pkl/{source}_{name}', 'rb')
    except OSError:
        return None
    json_content = pickle.load(pickle_db)
    pickle_db.close()
    return json_content


def get_cached_repositories_list():
    try:
        # Open the cached list
        pickle_db = open(f'pkl/list', 'rb')
        list = pickle.load(pickle_db)
        pickle_db.close()
        return json.loads(str(list).replace("'", '"'))

    # If the list does not exist, pickle an empty array
    except OSError:
        return json.loads("[]")


def add_to_cached_repositories_list(json_to_add):
    try:
        # Open the cached list
        pickle_db = open(f'pkl/list', 'rb')
        repositories_list = pickle.load(pickle_db)
        pickle_db.close()

        # Python uses ' where JSON uses ", update to maintain consistency
        json_list = json.loads(str(repositories_list).replace("'", '"'))

        # Add new JSON to list
        json_list.append(json_to_add)

        # Write this JSON
        updated_pickle_db = open(f'pkl/list', 'wb')
        pickle.dump(json_list, updated_pickle_db)
        updated_pickle_db.close()

    # If the list does not exist, set up an empty list
    except OSError:
        setup_empty_repositories_list()
        add_to_cached_repositories_list(json_to_add)

def setup_empty_repositories_list():
    new_pickle_db = open(f'pkl/list', 'wb')
    empty_pickle = json.loads("[]")
    pickle.dump(empty_pickle, new_pickle_db)
    new_pickle_db.close()

def remove_already_analysed_commits(old, new):
    length = 0
    for analysis_branch in old:
        for analysis in analysis_branch:
            length += len(analysis_branch[analysis]["commits"])

    remove_commits = new["commits"][:-length]
    new["commits"] = remove_commits


if __name__ == "__main__":
    load_dotenv(".env")
    openai_client = OpenAI()

    app = Flask(__name__)
    socketio = SocketIO(app, cors_allowed_origins="https://localhost:3000")


    @app.route('/analyse', methods=['POST'])
    @cross_origin()
    def analyse():
        try:
            data = request.json
            code = data.get("code")

            # Get analysis
            json_string = analyse_single_file(openai_client, code)
            parsed_json = json.loads(json_string)

            # Return analysis
            return [{"uploadedCode": parsed_json}], 200

        except json.JSONDecodeError as e:
            return {"error": f"Invalid JSON format returned by analysis, error: {e}"}, 400
        except Exception as e:
            return {"error": e}, 500


    @app.route('/analyseRemoteRepository', methods=['POST'])
    @cross_origin()
    def analyse_remote_repository():
        try:
            data = request.json
            url = data.get('url')
            title = data.get('title')
            project_number = data.get('number')

            # Return analysis from cache, if already analysed
            cache = get_cache("gitlab", project_number)
            if not cache is None:
                return cache, 200

            # Get analysis
            analysis = analyse_remote_codebase(openai_client, url, project_number)

            # Add to cache
            set_cache("gitlab", project_number,
                      [{f"{analysis["commits"][0]["title"]} ({analysis["commits"][0]["short_id"]})": analysis}])
            add_to_cached_repositories_list(
                {"name": title, "number": project_number, "url": url})

            # Return analysis
            return [
                {f"{analysis["commits"][0]["title"]} ({analysis["commits"][0]["short_id"]})": analysis}], 200

        except json.JSONDecodeError as e:
            return {"error": f"Invalid JSON format returned by analysis, error: {e}"}, 400
        except Exception as e:
            return {"error": e}, 500


    @app.route('/getRepositories', methods=['GET'])
    @cross_origin()
    def get_repositories():
        try:
            try:
                private_token = os.environ.get("GITLAB_API_KEY")
                if not private_token:
                    return {"error": "Unauthorised"}, 401
                session = requests.Session()
                response = session.get(
                    f"https://{os.environ.get('GITLAB_DOMAIN')}/api/v4/projects"
                    f"?private_token={private_token}&per_page=100&membership=true&simple=true", timeout=5)

                parsed_json = json.loads(response.content)
            except json.JSONDecodeError as e:
                print(e)
                return {"error": "Invalid JSON"}, 400
            except Exception as e:
                return {"error": e}, 500
            json_trimmed = []
            for repository in parsed_json:
                json_trimmed.append(
                    {"name": repository["name"], "id": repository["id"], "url": repository["http_url_to_repo"]})
            return json_trimmed, 200
        except Exception as e:
            return {"error": e}, 500


    @app.route('/updateGitlab', methods=['POST'])
    @cross_origin()
    def update_gitlab():
        try:
            data = request.json
            gitlab_private_token = data.get('token')
            if not gitlab_private_token:
                return {"error": "No token provided"}, 400
            try:
                session = requests.session()
                response = session.get(
                    f"https://{os.environ.get('GITLAB_DOMAIN')}/api/v4/user"
                    f"?private_token={gitlab_private_token}", timeout=5)
                if response.status_code != 200:
                    return {"error": response.text}, response.status_code
                parsed_json = json.loads(response.content)
            except json.JSONDecodeError as e:
                print(e)
                return {"error": "Invalid JSON"}, 400
            except Exception as e:
                return {"error": e}, 500

            dotenv.set_key(".env", "GITLAB_API_KEY", gitlab_private_token)
            load_dotenv(".env")
            return parsed_json, 200
        except Exception as e:
            return {"error": e}, 500


    @app.route('/updateOpenai', methods=['POST'])
    @cross_origin()
    def update_openai():
        try:
            data = request.json
            openai_api_key = data.get('key')
            authenticated, reason = check_openai(openai_api_key)
            if authenticated:
                dotenv.set_key(".env", "OPENAI_API_KEY", openai_api_key)
                load_dotenv(".env")
                return {}, 200
            return {"error": reason}, 400
        except Exception as e:
            return {"error": e}, 500


    # Checks if the user is authenticated for GitLab and OpenAI API
    @app.route('/getAuthenticationStatus', methods=['GET'])
    @cross_origin()
    def get_authentication_status():
        try:
            load_dotenv(".env")
            gitlab_authenticated = True
            session = requests.Session()
            response = session.get(
                f"https://{os.environ.get('GITLAB_DOMAIN')}/api/v4/user"
                f"?private_token={os.environ.get('GITLAB_API_KEY')}", timeout=5)
            openai_authenticated, reason = check_openai(os.environ.get("OPENAI_API_KEY"))
            if response.status_code != 200:
                return {"gitlabAuthenticated": False, "openaiAuthenticated": openai_authenticated}, 200
            parsed_json = json.loads(response.content)
            return {"gitlabAuthenticated": True, "openaiAuthenticated": openai_authenticated,
                    "avatar_url": parsed_json["avatar_url"], "name": parsed_json["name"],
                    "username": parsed_json["username"]}, 200
        except Exception as e:
            return {"error": e}, 500


    @app.route('/getCachedRepositories', methods=['GET'])
    @cross_origin()
    def get_cached_repositories():
        try:
            cached_repositories = get_cached_repositories_list()
            return cached_repositories, 200
        except Exception as e:
            return {"error": e}, 500

    @app.route('/analyseUpdatedBranch', methods=['POST'])
    @cross_origin()
    def analyse_updated_branch():
        try:
            data = request.json
            project_number = data.get('number')

            # Get cache, if none exists - return error
            cache = get_cache("gitlab", project_number)
            if cache is None:
                return {"error": "This project has not been analysed yet"}, 500

            # Get URL for project
            url = None
            for project in get_cached_repositories_list():
                if project["number"] == project_number:
                    url = project["url"]
                    break
            if url is None:
                return {"error": f"No URL provided for {project_number}"}, 500

            # Get new commits, if none - return error
            commits = get_commits(project_number)
            for cached_branch in cache:
                for commit in cached_branch:
                    if commit == f"{commits[0]["title"]} ({commits[0]["short_id"]})":
                        return {"error": f"Project {str(project_number)} has had no new commits since analysis"}, 500

            # Perform analysis
            json_string = analyse_updated_remote_codebase(cache, openai_client, url, project_number)
            remove_already_analysed_commits(cache, json_string)

            # Append commits to cache
            cache.append({f"{json_string["commits"][0]["title"]} ({json_string["commits"][0]["short_id"]})": json_string})
            update_cache("gitlab", project_number, cache)

            # Return updated cache as response
            return cache, 200

        except json.JSONDecodeError as e:
            return {"error": f"Invalid JSON format returned by analysis, error: {e}"}, 400
        except Exception as e:
            return {"error": e}, 500


    app.run(port=5002, ssl_context=("../certs/localhost.pem", "../certs/localhost-key.pem"))
