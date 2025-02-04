import json
import os
import subprocess
import pickle

import dotenv
import requests
from enum import Enum

from dotenv import load_dotenv
from re import findall

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO
from pydantic import BaseModel, Field
from openai import OpenAI
from numpy import concatenate

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

def analyse_code(client, prompt, code, response_format):
    completion = client.beta.chat.completions.parse(
        model="gpt-4o",
        store=True,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": code}
        ],
        response_format=response_format,
    )
    return completion.choices[0].message.content

def analyse_single_file(client, code):
    return analyse_code(client, SINGLE_FILE_PROMPT, code, CodeAnalysis)

class PackException(Exception):
    pass

def get_directory_structure(packed_codebase):
    filepaths = findall("<file path=\"(.*)\">\n", packed_codebase)
    print(filepaths)
    return filepaths

def pack_codebase(command):
    print(subprocess.check_output(command))
    if not os.path.isfile('out.xml'):
        raise PackException("Packed codebase file not found")
    file = open('out.xml', 'r')
    packed_codebase = file.read()
    directory_structure = get_directory_structure(packed_codebase)
    if not directory_structure:
        raise PackException("No files in specified directory")
    os.remove("out.xml") # Delete packed codebase
    return packed_codebase, directory_structure

def analyse_multiple_files(client, command):
    packed_codebase, directory_structure = pack_codebase(command)
    print(packed_codebase)
    print(directory_structure)

    class FileAnalysis(BaseModel):
        filepath: list[Enum("FilePath", {item: item for item in directory_structure})] =(
            Field(description="Filepath of the code in question")) # ChatGPT generated `item: item for item`
        issues: list[Issue] = Field(description="List of code issues within the file at the given filepath")

    class CodebaseAnalysis(BaseModel):
        issuesSummaryTitle: str = Field(
            description="Describe the status of the code considering the errors found in the "
                        "form of a title in less than 8 words")
        issuesSummary: str = Field(description="Give summary of the issues found in the code in 20 words or less.")

        files: list[FileAnalysis]

    code_analysis = analyse_code(client, CODEBASE_PROMPT, packed_codebase, CodebaseAnalysis)
    return json.loads(code_analysis)

def analyse_local_codebase(client, path):
    return analyse_multiple_files(client, ['repomix', path, '--output', 'out.xml', '--output-show-line-numbers', '--no-security-check', '--style', 'xml',
         '--ignore', '**/*.svg,**/*.jpg,**/*.jpeg,**/*.png,**/.git,**/*.json,**/*.txt,**/*.md,**/.gitignore,**/.env'])

def analyse_remote_codebase(client, url, project_number):
    json_analysis = analyse_multiple_files(client, ['repomix', '--remote', url, '--output', 'out.xml', '--output-show-line-numbers', '--no-security-check', '--style', 'xml',
         '--ignore', '**/*.svg,**/*.jpg,**/*.jpeg,**/*.png,**/.git,**/*.json,**/*.txt,**/*.md,**/.gitignore,**/.env'])
    for file in json_analysis.get("files"):
        filepath = file["filepath"][0].replace("/","%2F")
        code = requests.get(
            "https://gitlab.scss.tcd.ie/api/v4/projects/{}/repository/files/{}/raw"
            "?private_token={}&per_page=100&membership=true&ref=main"
            .format(project_number, filepath, os.environ.get("GITLAB_API_KEY")))
        file["code"] = code.text
    return json_analysis

def check_openai(openai_api_key):
    if not openai_api_key:
        return False, "No key provided"
    if not openai_api_key.startswith("sk-"):
        return False, "Invalid key"
    return True, ""

if __name__ == "__main__":
    load_dotenv(".env")
    openai_client = OpenAI()
    # analyse_single_file(client, "INSERT_CODE_HERE")
    # analyse_multiple_files(openai_client, "/Users/Darragh/Scil/")

    app = Flask(__name__)
    socketio = SocketIO(app, cors_allowed_origins="*")

    # Enable Cross Origin to prevent errors regarding frontend origins
    CORS(app)

    @app.route('/analyse', methods=['POST'])
    @cross_origin()
    def analyse():
        data = request.json
        code = data.get('code')
        try:
            json_string = analyse_single_file(openai_client, code)
            parsed_json = json.loads(json_string)
        except json.JSONDecodeError as e:
            print(e)
            return {"error": "Invalid JSON"}, 400
        except Exception as e:
            return {"error": "Internal Server Error"}, 500

        return (parsed_json, 200)


    @app.route('/analyseRemoteRepository', methods=['POST'])
    @cross_origin()
    def analyse_remote_repository():
        data = request.json
        url = data.get('url')
        project_number = data.get('number')
        try:
            json_string = analyse_remote_codebase(openai_client, url, project_number)
        except json.JSONDecodeError as e:
            print(e)
            return {"error": "Invalid JSON"}, 400
        except Exception as e:
            return {"error": "Internal Server Error"}, 500

        return json_string, 200

    @app.route('/getRepositories', methods=['GET'])
    @cross_origin()
    def get_repositories():
        # data = request.json
        # code = data.get('code')
        try:
            private_token = os.environ.get("GITLAB_API_KEY")
            if not private_token:
                return {"error": "Unauthorised"}, 401
            response = requests.get(
                "https://gitlab.scss.tcd.ie/api/v4/projects"
                f"?private_token={private_token}&per_page=100&membership=true&simple=true")

            parsed_json = json.loads(response.content)
        except json.JSONDecodeError as e:
            print(e)
            return {"error": "Invalid JSON"}, 400
        except Exception as e:
            return {"error": "Internal Server Error"}, 500
        json_trimmed = []
        for repository in parsed_json:
            json_trimmed.append({"name": repository["name"], "id": repository["id"], "url": repository["http_url_to_repo"]})
        return json_trimmed, 200


    @app.route('/updateGitlab', methods=['POST'])
    @cross_origin()
    def update_gitlab():
        data = request.json
        gitlab_private_token = data.get('token')
        if not gitlab_private_token:
            return {"error": "No token provided"}, 400
        try:
            response = requests.get(
                "https://gitlab.scss.tcd.ie/api/v4/user"
                f"?private_token={gitlab_private_token}")
            if response.status_code != 200:
                return {"error": response.text}, response.status_code
            parsed_json = json.loads(response.content)
        except json.JSONDecodeError as e:
            print(e)
            return {"error": "Invalid JSON"}, 400
        except Exception as e:
            return {"error": "Internal Server Error"}, 500

        dotenv.set_key(".env", "GITLAB_API_KEY", gitlab_private_token)
        load_dotenv(".env")
        return parsed_json, 200


    @app.route('/updateOpenai', methods=['POST'])
    @cross_origin()
    def update_openai():
        data = request.json
        openai_api_key = data.get('key')
        authenticated, reason = check_openai(openai_api_key)
        if authenticated:
            dotenv.set_key(".env", "OPENAI_API_KEY", openai_api_key)
            load_dotenv(".env")
            return {}, 200
        return {"error": reason}, 400

    # Checks if the user is authenticated for GitLab and OpenAI API
    @app.route('/getAuthenticationStatus', methods=['GET'])
    @cross_origin()
    def get_authentication_status():
        load_dotenv(".env")
        gitlab_authenticated = True
        response = requests.get(
            "https://gitlab.scss.tcd.ie/api/v4/user"
            f"?private_token={os.environ.get("GITLAB_API_KEY")}")
        openai_authenticated, reason = check_openai(os.environ.get("OPENAI_API_KEY"))
        if response.status_code != 200:
            return {"gitlabAuthenticated": False, "openaiAuthenticated": openai_authenticated}, 200
        parsed_json = json.loads(response.content)
        return {"gitlabAuthenticated": True, "openaiAuthenticated": openai_authenticated, "avatar_url" : parsed_json["avatar_url"], "name" : parsed_json["name"], "username" : parsed_json["username"]}, 200

    app.run(port=5000)


# repomix --remote [REPO_HERE] --output out.xml --output-show-line-numbers --no-security-check --style xml --ignore **/*.svg,**/*.jpg,**/*.jpeg,**/*.png,**/.git,**/*.json,**/*.txt,**/*.md,**/.gitignore,**/.env