import os
import subprocess
from enum import Enum

from re import findall
from pydantic import BaseModel, Field
from openai import OpenAI

EMPTY_DIRECTORY_END = ("================================================================\nFiles\n======================"
                       "==========================================\n")
SINGLE_FILE_PROMPT = ("Analyse the code provided by the user, giving the response in a json, identifying all major, "
                      "moderate and code quality issues, giving a title, description and severity for each, noting the "
                      "issue type and line numbers where any issues are found.")
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
    issues: list[Issue]

# class FileDirectory(str, Enum):
#     global files_in_directory
#     for file in files_in_directory:
#         filepath = file



def analyse(client, prompt, code, response_format):
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
    analyse(client, SINGLE_FILE_PROMPT, code, CodeAnalysis)

class PackException(Exception):
    pass

def get_directory_structure(packed_codebase):
    filepaths = findall("<file path=\"(.*)\">\n", packed_codebase)
    print(filepaths)
    return filepaths

def pack_codebase(path):
    print(subprocess.check_output(
        ['repomix', path, '--output', 'out.xml', '--output-show-line-numbers', '--no-security-check', '--style', 'xml',
         '--ignore', '**/*.svg,**/*.jpg,**/*.jpeg,**/*.png,**/.git,**/*.json,**/*.txt,**/*.md,**/.gitignore']))
    if not os.path.isfile('out.xml'):
        raise PackException("Packed codebase file not found")
    file = open('out.xml', 'r')
    packed_codebase = file.read()
    directory_structure = get_directory_structure(packed_codebase)
    if not directory_structure:
        raise PackException("No files in specified directory")
    os.remove("out.xml") # Delete packed codebase
    return packed_codebase, directory_structure

def analyse_multiple_files(client, path):
    packed_codebase, directory_structure = pack_codebase(path)
    print(packed_codebase)
    print(directory_structure)

    class FileAnalysis(BaseModel):
        filepath: list[Enum("FilePath", {item: item for item in
                                         directory_structure})] # ChatGPT generated `item: item for item`
        issues: list[Issue]

    class CodebaseAnalysis(BaseModel):
        files: list[FileAnalysis]

    print(analyse(client, CODEBASE_PROMPT, packed_codebase, CodebaseAnalysis))


if __name__ == "__main__":
    os.environ["OPENAI_API_KEY"] = ("API_KEY_HERE")
    openai_client = OpenAI()
    # analyse_single_file(client, """import socket
    # import time
    # import threading
    # import tkinter as tk
    #
    #
    #
    # SOCKET_BUFFER_SIZE = 4096
    # HTTP_PORT = 80
    # PROXY_PORT = 8080
    # ENABLE_SO_REUSEADDR = 1
    # EMPTY_REQUEST = b''
    # HTTP_PREFIX = b'CONNECT'
    # END_OF_URL = b'/'
    # HTTP_SUCCESS = b'HTTP/1.0 200 Connection established\r\n\r\n'
    # PROXY_ADDRESS = 'localhost'
    # HTTP_FAIL = f'HTTP/1.0 502 Bad Gateway\r\n\r\n'
    #
    #
    # def handle_request(user_socket):
    #     request = user_socket.recv(SOCKET_BUFFER_SIZE)
    #     print('"Request is: "' + str(request) + '"')
    #     if not request == EMPTY_REQUEST:
    #         if is_https(request):
    #             handle_https_request(user_socket, request)
    #         else:
    #             handle_http_request(user_socket, request)
    #     user_socket.close()
    #
    #
    # def is_https(request):
    #     if request.startswith(HTTP_PREFIX):
    #         return True
    #     return False
    #
    #
    # def handle_https_request(user_socket, request):
    #     destination_socket = establish_https_destination_socket(request)
    #     if destination_socket:
    #         send_success_response(user_socket)
    #         send_via_tunnel(user_socket, destination_socket)
    #     else:
    #         send_failure_response(user_socket)
    #
    #
    # def handle_http_request(user_socket, request):
    #     destination_socket = establish_http_destination_socket(request)
    #     if destination_socket:
    #         send_and_cache(user_socket, destination_socket, request)
    #     else:
    #         send_failure_response(user_socket)
    #
    #
    # def get_address_port(request):
    #     request_split = str(request).split()
    #     address_port = request_split[1].split(':')
    #     address = address_port[0]
    #     port = int(address_port[1])
    #     if address[-1:] == END_OF_URL:
    #         address = address[:-1]
    #     return address, port
    #
    #
    # def establish_https_destination_socket(request):
    #     try:
    #         global blocked_urls
    #         destination_address, port_number = get_address_port(request)
    #         for url in blocked_urls:
    #             if url in destination_address:
    #                 return None
    #         destination_socket = get_destination_socket(destination_address, port_number)
    #         return destination_socket
    #     except:
    #         return None
    #
    #
    # def establish_http_destination_socket(request):
    #     try:
    #         destination_address = get_http_address(request)
    #         global blocked_urls
    #         for url in blocked_urls:
    #             if url in destination_address.decode():
    #                 return None
    #         destination_socket = get_destination_socket(destination_address, HTTP_PORT)
    #         return destination_socket
    #     except:
    #         return None
    #
    #
    # def get_http_address(request):
    #     segments = request.split()
    #     address = segments[1][7:]
    #     if address[-1:] == END_OF_URL:
    #         return address[:-1]
    #     return address
    #
    #
    # def get_destination_socket(destination_address, port_number):
    #     destination_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    #     destination_socket.connect((destination_address, port_number))
    #     return destination_socket
    #
    #
    # def send_success_response(successful_socket):
    #     successful_socket.send(HTTP_SUCCESS)
    #
    #
    # def send_failure_response(failure_socket):
    #     failure_socket.send(HTTP_FAIL.encode())
    #
    #
    # def send_via_tunnel(user_socket, destination_socket):
    #     user_destination_thread, destination_user_thread = get_threads(user_socket, destination_socket)
    #     establish_tunnel(user_destination_thread, destination_user_thread)
    #     close_tunnel(user_destination_thread, destination_user_thread)
    #     destination_socket.close()
    #
    #
    # def send_and_cache(user_socket, destination_socket, request):
    #     destination_socket.send(request)
    #     if not contained_in_cache(request):
    #
    #         start_time = time.time()
    #         global http_request_active
    #         http_request_active = True
    #         global cache
    #         newIndex = len(cache)
    #         cache.append([request, -1]) # -1 placeholder for HTTP request time
    #         global http_request_time
    #         while True:
    #             data = destination_socket.recv(SOCKET_BUFFER_SIZE)
    #             if not data:
    #                 break
    #             cache[newIndex].append(data)
    #             user_socket.sendall(data)
    #             http_request_time = [request, time.time() - start_time]
    #     else:
    #         get_from_cache(user_socket, request)
    #
    # def contained_in_cache(request):
    #     global cache
    #     for i in range(len(cache)):
    #         if cache[i][0] == request:
    #             return True
    #     return False
    #
    # def delete_from_cache(url):
    #     global cache
    #     for i in range(len(cache)):
    #         if get_http_address(cache[i][0]).decode() in url:
    #             cache.remove(cache[i])
    #             print("Removed " + url + " from cache!")
    #
    # def get_from_cache(user_socket, request):
    #     start_time = time.time()
    #     print("Getting from cache...")
    #     global cache
    #     for i in range(len(cache)):
    #         if cache[i][0] == request:
    #             total_bytes_sent = 0
    #             for j in range(len(cache[i])-2):
    #                 data = cache[i][j+2]
    #                 user_socket.sendall(data)
    #                 total_bytes_sent += len(data)
    #             time_elapsed = time.time() - start_time
    #             time_saved = cache[i][1] - time_elapsed
    #             print("Time taken from cache: " + str(time_elapsed) + ", saving " + str(time_saved))
    #             global time_bytes
    #             time_bytes.append([time_elapsed, total_bytes_sent])
    #             global time_saved_from_caching
    #             time_saved_from_caching += time_saved
    #             print(get_bandwidth())
    #
    #
    # def get_threads(user_socket, destination_socket):
    #     user_destination_thread = threading.Thread(target=receive_and_send, args=(user_socket, destination_socket))
    #     destination_user_thread = threading.Thread(target=receive_and_send, args=(destination_socket, user_socket))
    #     return user_destination_thread, destination_user_thread
    #
    #
    # def receive_and_send(receiving_socket, sending_socket):
    #     while True:
    #         data = receiving_socket.recv(SOCKET_BUFFER_SIZE)
    #         if not data:
    #             break
    #         sending_socket.sendall(data)
    #
    #
    # def establish_tunnel(user_destination_thread, destination_user_thread):
    #     user_destination_thread.start()
    #     destination_user_thread.start()
    #
    #
    # def close_tunnel(user_destination_thread, destination_user_thread):
    #     user_destination_thread.join()
    #     destination_user_thread.join()
    #
    # def save_last_http_time():
    #     global http_request_active
    #     if http_request_active:
    #         global http_request_time
    #         time_elapsed = http_request_time[1]
    #         global cache
    #         bytes_length = 0
    #         for i in range(len(cache)):
    #             if cache[i][0] == http_request_time[0]:
    #                 cache[i][1] = time_elapsed
    #
    #                 for j in range(len(cache[i])-2):
    #                     bytes_length += len(cache[i][j+2])
    #
    #         print("Most recent HTTP request took: " + str(time_elapsed))
    #         global time_bytes
    #         time_bytes.append([time_elapsed, bytes_length])
    #         http_request_active = False
    #         print(get_bandwidth())
    #         global cached
    #         cached.insert(0, get_http_address(http_request_time[0]).decode() + " - " + str(bytes_length) + " bytes (original HTTP request took " + str(time_elapsed*1000) + " ms)")
    #
    # def get_bandwidth():
    #     global time_bytes
    #     total_bandwidth = 0
    #     total_bytes = 0
    #     for i in range(len(time_bytes)):
    #         total_bandwidth += time_bytes[i][1]/time_bytes[i][0]
    #         total_bytes += time_bytes[i][1]
    #     total_bandwidth = total_bandwidth / len(time_bytes)
    #     global time_saved_from_caching
    #     bandwith_description = "HTTP Average bandwidth: " + str(total_bandwidth/1000) + " kb/s\nTotal HTTP bytes: " + str(total_bytes) + "\nTime saved by use of cache: " + str(time_saved_from_caching)
    #     global summary
    #     summary.configure(text=bandwith_description)
    #     return bandwith_description
    #
    # def proxy():
    #     proxy = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    #     proxy.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, ENABLE_SO_REUSEADDR)
    #     proxy.bind((PROXY_ADDRESS, PROXY_PORT))
    #     proxy.listen()
    #     while True:
    #         user_socket, _ = proxy.accept()
    #         request_thread = threading.Thread(target=handle_request, args=(user_socket,))
    #         request_thread.start()
    #         save_last_http_time()
    #
    # def setup_gui():
    #     global blocked_urls
    #     def removeElement(event):
    #         value=listbox.get(listbox.curselection())
    #         blocked_urls.remove(value)
    #         listbox.delete(listbox.curselection())
    #     def submit(*args):
    #
    #         input_text = input.get()
    #         delete_from_cache(input_text)
    #         if not (input_text in blocked_urls or input_text == ""):
    #             blocked_urls.append(input_text)
    #             listbox.insert(0, input_text)
    #
    #     gui = tk.Tk()
    #     button = tk.Button(gui, text ="Block URL", command = submit)
    #     input = tk.Entry(gui, width = 60)
    #     listbox = tk.Listbox(gui, height = 20, width = 80, fg = "black", bg = "white", activestyle = 'dotbox')
    #     global cached
    #     cached = tk.Listbox(gui, height = 20, width = 80, fg = "black", bg = "white", activestyle = 'dotbox')
    #     gui.geometry("900x900")
    #     title = tk.Label(gui, text = "Blocked Domains (Press enter to remove)")
    #     cache_heading = tk.Label(gui, text = "Cached sites:")
    #     global summary
    #     summary = tk.Label(gui, text = "No bandwidth information available yet!")
    #     listbox.bind("<Return>", removeElement)
    #     input.bind("<Return>", submit)
    #     title.pack()
    #     listbox.pack()
    #     input.pack()
    #     button.pack()
    #     cache_heading.pack()
    #     cached.pack()
    #     summary.pack()
    #     return gui
    #
    # if __name__ == '__main__':
    #     global blocked_urls
    #     blocked_urls = []
    #     global cache
    #     cache = []
    #     global http_request_active
    #     http_request_active = False
    #     global http_request_time
    #     http_request_time = ["request" ,time.time()]
    #     global time_bytes
    #     time_bytes = []
    #     global time_saved_from_caching
    #     time_saved_from_caching = 0
    #     gui = setup_gui()
    #     proxy_thread = threading.Thread(target=proxy)
    #     proxy_thread.start()
    #     gui.mainloop()
    # """)
    analyse_multiple_files(openai_client, "/Users/Darragh/Scil/")
