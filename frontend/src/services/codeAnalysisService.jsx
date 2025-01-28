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

export const lineContainsIssue = (lineNo, issues) => {
    for (var i = 0; i < issues.length; i++) {
        if (issues[i].lineNumbers.includes(lineNo)) {
            return true;
        }
    }
    return false;
}