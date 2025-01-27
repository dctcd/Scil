import React, {useState} from 'react'
import {Box, Hidden, Stack, Typography} from "@mui/material";
import Content from "./Content";
import Commits from "./Commits";

const Project = () => {
    // const [commits, setCommits] = useState([["Added code in UI", "You", new Date().toUTCString(),
    //     (project.codeSecurityRisks ? project.codeSecurityRisks.length.toString() : "0") + " security risks, " + (project.codeQualityIssues ? project.codeQualityIssues.length.toString() : "0") + " quality issues and " + (project.codeFlaws ? project.codeFlaws.length.toString() : "0") + " flaws."
    // ]]);
    // const [headline, setHeadline] = useState(project.codeSecurityRisks ? (((project.codeSecurityRisks.length + project.codeQualityIssues + project.codeFlaws) > 0) ? "There are issues in your code" : "Everything looks good") : "");
    // const [description, setDescription] = useState(project.analysisSummary ? project.analysisSummary : "");
    // const [inputErrors, setInputErrors] = useState(
    //     () => {
    //         var errorArray = [];
    //         if (project.codeSecurityRisks) {
    //             (project.codeSecurityRisks).map(codeSecurityRisk => {
    //                 errorArray.push([2, codeSecurityRisk.title.toString(), codeSecurityRisk.explanation.toString(), codeSecurityRisk.lineNumbers.join(",") ? "Lines: " + codeSecurityRisk.lineNumbers.join(",") : ""])
    //             })
    //         }
    //         if (project.codeFlaws) {
    //             (project.codeFlaws).map(codeFlaw => {
    //                 errorArray.push([1, codeFlaw.title.toString(), codeFlaw.explanation.toString(), codeFlaw.lineNumbers.join(",") ? "Lines: " + codeFlaw.lineNumbers.join(",") : ""])
    //             })
    //         }
    //         if (project.codeQualityIssues) {
    //             (project.codeQualityIssues).map(codeQualityIssue => {
    //                 errorArray.push([0, codeQualityIssue.title.toString(), codeQualityIssue.explanation.toString(), codeQualityIssue.lineNumbers.join(",") ? "Lines: " + codeQualityIssue.lineNumbers.join(",") : ""])
    //             })
    //         }
    //         return errorArray;
    //     }
    // );
    return (
        <Stack direction="row">
            {/*<Stack flexGrow={1} flexDirection="column">*/}
            {/*    <Content inputErrors={inputErrors} headline={headline} description={description}/>*/}
            {/*    <Box variant="body1" margin="10px" paddingLeft="15px" color="#000000" bgcolor="#FFF8E6"*/}
            {/*         sx={{borderRadius: 4, flexGrow: 1, flexDirection: "column", marginBottom: "10px"}}>*/}
            {/*        <Typography>{project.code ? ((project.code).split('\n').map((str, index) =>*/}
            {/*            <p>{index.toString() + "  " + str}</p>)) : "Loading..."}</Typography>*/}
            {/*    </Box>*/}
            {/*    <Hidden mdUp implementation="css">*/}
            {/*        <Commits style={{float: "right"}} commitsInput={commits}/>*/}
            {/*    </Hidden>*/}
            {/*</Stack>*/}
            {/*<Hidden mdDown implementation="css">*/}
            {/*    <Box sx={{width: "300px"}}>*/}
            {/*        <Commits commitsInput={commits}/>*/}
            {/*    </Box>*/}
            {/*</Hidden>*/}
        </Stack>
    )
}
export default Project