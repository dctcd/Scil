import React from 'react'
import {Box, Hidden, Stack} from "@mui/material";
import Content from "./Content";
import Commits from "./Commits";

const Home = ({project}) => {
    return (
        <Stack direction="row">
            <Stack flexGrow={1} flexDirection="column">
                <Content inputErrors={[
                    [0, "ProjectContext", project],
                    [0, "Indentation", "Indent lines 1-9"],
                    [1, "Syntax Error", "Missing closing brace on line 4"],
                    [2, "Variable Name", "Undefined variable on line 6"],
                    [1, "Unused Import", "Remove unused import on line 2"],
                    [2, "Logic Error", "Incorrect condition on line 7"],
                    [0, "Redundant Code", "Remove duplicate code on lines 8-9"],
                    [1, "Data Type", "Use integer instead of string on line 5"],
                    [0, "Spacing", "Add space after ',' on line 3"],
                    [2, "Null Check", "Add null check on line 10"],
                    [1, "Type Error", "Mismatched types in comparison on line 11"]
                ]} headline={"Everything looks good"} description={"No flaws to report"}/>
                <Hidden mdUp implementation="css">
                    <Commits style={{float: "right"}} commitsInput={[
                        ["Fixed login bug", "Alice", "5 minutes ago", "1 major issue, 2 code quality issues"],
                        ["Refactored user authentication", "Bob", "12 minutes ago", "0 major issues, 1 moderate issue, 3 code quality issues"],
                        ["Updated README with setup instructions", "Charlie", "30 minutes ago", "0 major issues, 0 moderate issues, 1 code quality issue"],
                        ["Added error handling to API requests", "Alice", "1 hour ago", "1 major issue, 0 moderate issues, 2 code quality issues"],
                        ["Improved performance of data fetching", "Dana", "2 hours ago", "0 major issues, 2 moderate issues, 1 code quality issue"],
                        ["Resolved merge conflicts in dashboard module", "Eve", "3 hours ago", "2 major issues, 1 moderate issue, 4 code quality issues"],
                        ["Added unit tests for User model", "Frank", "5 hours ago", "0 major issues, 1 moderate issue, 3 code quality issues"],
                        ["Optimized image loading in the gallery", "Alice", "6 hours ago", "1 major issue, 0 moderate issues, 2 code quality issues"],
                        ["Refactored CSS for responsive layout", "Charlie", "7 hours ago", "0 major issues, 2 moderate issues, 5 code quality issues"],
                        ["Updated package dependencies", "Dana", "1 day ago", "0 major issues, 1 moderate issue, 0 code quality issues"],
                        ["Fixed broken links in footer", "Eve", "2 days ago", "0 major issues, 0 moderate issues, 1 code quality issue"],
                        ["Enhanced security for token storage", "Bob", "3 days ago", "1 major issue, 0 moderate issues, 2 code quality issues"]
                    ]}/>
                </Hidden>

            </Stack>
            <Hidden mdDown implementation="css">
                <Box sx={{width: "300px"}}>
                    <Commits commitsInput={[
                        ["Fixed login bug", "Alice", "5 minutes ago", "1 major issue, 2 code quality issues"],
                        ["Refactored user authentication", "Bob", "12 minutes ago", "0 major issues, 1 moderate issue, 3 code quality issues"],
                        ["Updated README with setup instructions", "Charlie", "30 minutes ago", "0 major issues, 0 moderate issues, 1 code quality issue"],
                        ["Added error handling to API requests", "Alice", "1 hour ago", "1 major issue, 0 moderate issues, 2 code quality issues"],
                        ["Improved performance of data fetching", "Dana", "2 hours ago", "0 major issues, 2 moderate issues, 1 code quality issue"],
                        ["Resolved merge conflicts in dashboard module", "Eve", "3 hours ago", "2 major issues, 1 moderate issue, 4 code quality issues"],
                        ["Added unit tests for User model", "Frank", "5 hours ago", "0 major issues, 1 moderate issue, 3 code quality issues"],
                        ["Optimized image loading in the gallery", "Alice", "6 hours ago", "1 major issue, 0 moderate issues, 2 code quality issues"],
                        ["Refactored CSS for responsive layout", "Charlie", "7 hours ago", "0 major issues, 2 moderate issues, 5 code quality issues"],
                        ["Updated package dependencies", "Dana", "1 day ago", "0 major issues, 1 moderate issue, 0 code quality issues"],
                        ["Fixed broken links in footer", "Eve", "2 days ago", "0 major issues, 0 moderate issues, 1 code quality issue"],
                        ["Enhanced security for token storage", "Bob", "3 days ago", "1 major issue, 0 moderate issues, 2 code quality issues"]
                    ]}/>
                </Box>
            </Hidden>
        </Stack>
    )
}
export default Home