import axios from "axios";
import {ProjectContext, TabContext, } from "../App";



process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const instance = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 100000,
    rejectUnauthorized: false,
});

export const getAnalysis = async (code, setProject, setAddCodeVisibility, setTab, availableProjects, setAvailableProjects) => {
    try {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        await instance.post('/analyse', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            code: code
        })
            .then(response => {
                // response.data = code;
                response.data.code = code;
                setProject(response.data);
                setTab("Home");
                setAddCodeVisibility(false);
                if (!availableProjects.includes(response.data.codeTitle)) {
                    var addTitle = [response.data.codeTitle];
                    setAvailableProjects(addTitle.concat(availableProjects));
                }
                return response.data;
            })
            .catch(e => {
                alert(JSON.stringify(e));
            });
    } catch (e) {
        if (e instanceof Error) alert(e);
    }
    return "";
}