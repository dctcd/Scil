import json
import os
import subprocess
import pickle
import platform
from importlib.resources import files

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
    if platform.system() == "Windows":
        print(subprocess.run(command, shell=True))
    else:
        print(subprocess.run(command))
    if not os.path.isfile('out.xml'):
        raise PackException("Packed codebase file not found")
    file = open('out.xml', 'r')
    packed_codebase = file.read()
    directory_structure = get_directory_structure(packed_codebase)
    if not directory_structure:
        raise PackException("No files in specified directory")
    file.close()
    if platform.system() == "Windows": # Delete packed codebase
        os.remove(os.getcwd() + "\\out.xml")
    else:
        os.remove("out.xml")
    return packed_codebase, directory_structure

def append_code_to_response(analysis_json, packed_codebase, directory_structure):
    # for file in json_analysis.get("files"):
    #     filepath = file["filepath"][0].replace("/", "%2F")
    #     session = requests.session()
    #     code = session.get(
    #         "https://{}/api/v4/projects/{}/repository/files/{}/raw"
    #         "?private_token={}&per_page=100&membership=true&ref=main"
    #         .format(os.environ.get('GITLAB_DOMAIN'),os.environ.get("GITLAB_API_KEY"),project_number, filepath, os.environ.get("GITLAB_API_KEY")), timeout=5)
    #     file["code"] = code.text

    for file in directory_structure:
        code = findall(f"<file path=\"{file}\">\n(.*?)\n</file>", packed_codebase, DOTALL)
        for file_analysis in analysis_json["files"]:
            if file_analysis["filepath"][0] == file:
                code_lines = code[0].splitlines()
                for code_line_index in range(len(code_lines)):
                    code_lines[code_line_index] = code_lines[code_line_index][code_lines[code_line_index].index(":")+2:len(code_lines[code_line_index])]
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


def analyse_local_codebase(client, path):
    return analyse_multiple_files(client, ['npx', 'repomix', path, '--output', 'out.xml', '--output-show-line-numbers',
                                           '--no-security-check', '--style', 'xml',
                                           '--ignore',
                                           '**/*.svg,**/*.jpg,**/*.jpeg,**/*.png,**/.git,**/*.json,**/*.txt,**/*.md,**/.gitignore,**/.env'])


def analyse_remote_codebase(client, url, project_number):
    json_analysis = analyse_multiple_files(client, ['npx', 'repomix', '--remote', url, '--output', 'out.xml',
                                                    '--output-show-line-numbers', '--no-security-check', '--style',
                                                    'xml',
                                                    '--ignore',
                                                    '**/*.svg,**/*.jpg,**/*.jpeg,**/*.png,**/.git,**/*.json,**/*.txt,**/*.md,**/.gitignore,**/.env'])
    session = requests.session()
    commits = session.get(
        "https://{}/api/v4/projects/{}/repository/commits?private_token={}&per_page=100&ref=main"
        .format(os.environ.get('GITLAB_DOMAIN'), project_number, os.environ.get("GITLAB_API_KEY")), timeout=5)
    json_analysis["commits"] = json.loads(commits.content)
    return json_analysis


def check_openai(openai_api_key):
    if not openai_api_key:
        return False, "No key provided"
    if not openai_api_key.startswith("sk-"):
        return False, "Invalid key"
    return True, ""


def set_cache(source, name, json):
    pickle_db = open(f'pkl/{source}_{name}', 'ab')
    pickle.dump(json, pickle_db)
    pickle_db.close()


def get_cache(source, name):
    try:
        pickle_db = open(f'pkl/{source}_{name}', 'rb')
    except OSError:
        return None
    json = pickle.load(pickle_db)
    pickle_db.close()
    return json


def get_cached_repositories_list():
    try:
        pickle_db = open(f'pkl/list', 'rb')
        list = pickle.load(pickle_db)
        pickle_db.close()
        return json.loads(str(list).replace("'", '"'))
    except OSError:  # if the list does not exist, pickle an empty array
        new_pickle_db = open(f'pkl/list', 'wb')
        empty_pickle = json.loads("[]")
        pickle.dump(empty_pickle, new_pickle_db)
        new_pickle_db.close()
        return json.loads("[]")



def add_to_cached_repositories_list(json_to_add):
    try:
        pickle_db = open(f'pkl/list', 'rb')
        repositories_list = pickle.load(pickle_db)
        pickle_db.close()
        json_list = json.loads(str(repositories_list).replace("'", '"'))
        json_list.append(json_to_add)
        updated_pickle_db = open(f'pkl/list', 'wb')
        pickle.dump(json_list, updated_pickle_db)
        updated_pickle_db.close()
    except OSError:  # if the list does not exist, pickle an empty array
        new_pickle_db = open(f'pkl/list', 'wb')
        empty_pickle = json.loads("[]")
        empty_pickle.append(json_to_add)
        pickle.dump(empty_pickle, new_pickle_db)
        new_pickle_db.close()


if __name__ == "__main__":
    load_dotenv(".env")
    openai_client = OpenAI()
    # analyse_single_file(client, "INSERT_CODE_HERE")
    # analyse_multiple_files(openai_client, "/Users/Darragh/Scil/")

    app = Flask(__name__)

    # TEMP - BEGIN
    # socketio = SocketIO(app, cors_allowed_origins="*")
    # CORS(app)
    # TEMP - END
    socketio = SocketIO(app, cors_allowed_origins="https://localhost:3000")
    # sslify = SSLify(app)


    @app.route('/analyse', methods=['POST'])
    @cross_origin()
    def analyse():
        try:
            data = request.json
            code = data.get('code')
            try:
                json_string = analyse_single_file(openai_client, code)
                parsed_json = json.loads(json_string)
            except json.JSONDecodeError as e:
                print(e)
                return {"error": "Invalid JSON"}, 400
            except Exception as e:
                return {"error": e}, 500
            return (parsed_json, 200)
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
            try:
                cache = get_cache("gitlab", project_number)
                if not cache is None:
                    cache["source"] = "Cached – " + cache["source"]
                    return cache, 200
                json_string = analyse_remote_codebase(openai_client, url, project_number)
            except json.JSONDecodeError as e:
                print(e)
                return {"error": "Invalid JSON"}, 400
            except Exception as e:
                return {"error": e}, 500
            set_cache("gitlab", project_number, json_string)
            add_to_cached_repositories_list({"name": title, "number": project_number})
            return json_string, 200
        except Exception as e:
            return {"error": e}, 500

    @app.route('/getRepositories', methods=['GET'])
    @cross_origin()
    def get_repositories():
        # data = request.json
        # code = data.get('code')
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

    app.run(port=5000, ssl_context=("../certs/localhost.pem", "../certs/localhost-key.pem"))