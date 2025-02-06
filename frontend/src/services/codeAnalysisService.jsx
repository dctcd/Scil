import parse from "html-react-parser";
import {highlight, languages} from "prismjs/components/prism-core";

export const highlightAndFormatWhitespace = (line, language) => {
    var lineUnformatted = highlight(line, languages[language]);
    var lineUnformattedLength = lineUnformatted.length;
    for (var i = 0; i < lineUnformattedLength; i++) {
        if (lineUnformatted[i] === " ") {
            // lineUnformatted[i] = "&nbsp;";
            lineUnformatted = lineUnformatted.substring(0, i) + "&nbsp;" + lineUnformatted.substring(i + 1);
            // https://javascript.plainenglish.io/how-to-replace-a-character-at-a-particular-index-in-javascript-3375246c0ff8
            lineUnformattedLength += 5;
            i+=5;
        }
        else if (lineUnformatted[i] === "\t") {
            lineUnformatted[i] = "&nbsp;&nbsp;&nbsp;&nbsp;";
            lineUnformatted = lineUnformatted.substring(0, i) + "&nbsp;&nbsp;&nbsp;&nbsp;" + lineUnformatted.substring(i + 1); // https://javascript.plainenglish.io/how-to-replace-a-character-at-a-particular-index-in-javascript-3375246c0ff8
            lineUnformattedLength += 23;
            i+=23;
        }
        else break;
    }
    return parse(lineUnformatted);
}

export const getLineHighlight = (lineNo, issues, isMargin) => {
    var colour = isMargin ? "#FFDD85" : "#FFF8E6";
    for (var i = 0; i < issues.length; i++) {
        if (issues[i].lineNumbers.includes(lineNo)) {
            if(issues[i].type === "majorIssue") {
                colour = isMargin ? "#FF0000" : "#FF000040";
            }
            else if (issues[i].type === "moderateIssue" && colour !== "#FF000050") {
                colour = isMargin ? "#EABB41" : "#FFDD8570";
            }
            else if (issues[i].type === "codeQualityIssue" && colour !== "#FF000050" && colour !== "#FFDD8550") {
                colour = isMargin ? "#000000" : "#00000030";
            }
        }
    }
    return colour;
}

export const lineContainsIssue = (lineNo, issues) => {
    for (var i = 0; i < issues.length; i++) {
        if (issues[i].lineNumbers.includes(lineNo)) {
            return true;
        }
    }
    return false;
}

export const formatTimestamp = (timestamp) => {
    let now = new Date();
    let year = Number(timestamp.substring(0,4));
    let month = Number(timestamp.substring(5,7));
    let date = Number(timestamp.substring(8,10));
    let hour = timestamp.substring(11,13);
    let minute = timestamp.substring(14,16);
    if (date === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
        return hour + ":" + minute;
    }
    else if (year === now.getFullYear()) {
        return hour + ":" + minute + " " + date + " " + getMonthString(month);
    }
    return hour + ":" + minute + " " + date + " " + getMonthString(month) + " " + year;
    // if (time.getDate() === time.getDate()) {
    //     return String(time.getTime());
    // }
    // else if (time.getFullYear() === time.getFullYear()) {
    //     return String(timestamp.substring(11,15) + " " + timestamp.substring(5, 6) + " " + getMonthString(Number(timestamp.substring(5, 6))));
    // }
    // else {
    //     return String(timestamp.substring(11,15) + " " + timestamp.substring(5, 6) + " " + getMonthString(Number(timestamp.substring(5, 6))) + " " + timestamp.substring(0, 3));
    // }
}

export const getMonthString = (monthNo) => {
    switch (monthNo) {
        case 1:
            return "Jan";
        case 2:
            return "Feb";
        case 3:
            return "Mar";
        case 4:
            return "Apr";
        case 5:
            return "May";
        case 6:
            return "Jun";
        case 7:
            return "Jul";
        case 8:
            return "Aug";
        case 9:
            return "Sep";
        case 10:
            return "Oct";
        case 11:
            return "Nov";
        case 12:
            return "Dec";
    }
}

export const moveSingleAnalysisProjectToTop = (projects, project, setProjects, setProject) => {
    setProject(project["project"])
    function isNotMatch (projectMatch) {
        if (projectMatch.hasOwnProperty("project")) {
            if (projectMatch["project"] === project["project"]) {
                return false;
            }
        }
        return true;
    }

    setProjects([{"name" : project["name"], "project": project["project"]}].concat(projects.filter(isNotMatch)));
}