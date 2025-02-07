import React from 'react'
import {Box, Button, Stack, Typography, useTheme} from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ReportIcon from '@mui/icons-material/Report';
import CodeOffIcon from '@mui/icons-material/CodeOff';
import {getLineHighlight, highlightAndFormatWhitespace, lineContainsIssue} from "./services/codeAnalysisService";

const Content = ({inputErrors, title, headline, description, code}) => {

    const theme = useTheme();

    const codeQualityIssue =
        <Box variant="body1" p="5px" color="#FFFFFF" bgcolor="#000000"
                 sx={{borderRadius: "10px", marginBottom:"10px", display: "flex"}}>
            <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <CodeOffIcon style={{height: "20px", color: "#FFFFFF", marginRight: "5px"}}/>
                <Typography>Code Quality</Typography>
            </Box>
        </Box>;

    const moderateIssue =
        <Box variant="body1" p="5px" color="#000000" bgcolor="#FFDD85"
                sx={{borderRadius: "10px", marginBottom:"10px", display: "flex"}}>
            <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", flexGrow:1, width:"100%"}}>
                <WarningAmberOutlinedIcon style={{height: "20px", color: "#000000", marginRight: "5px"}}/>
                <Typography>Moderate</Typography>
            </Box>
        </Box>;

    const majorIssue =
        <Box variant="body1" p="5px" color="#FFFFFF" bgcolor="#F18787"
                 sx={{borderRadius: "10px", marginBottom:"10px", display: "flex"}}>
            <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <ReportIcon style={{height: "20px", color: "#FFFFFF", marginRight: "5px"}}/>
                <Typography>Major</Typography>
            </Box>
        </Box>;

    const errorStackStyle = () => {
        return {
            maxWidth: (window.innerWidth >= theme.breakpoints.values.md ? "calc(100vw - 475px)" : "calc(100vw - 15px)"),  display: "flex", flexDirection: "column", marginBottom: "5px", marginTop: "5px", marginLeft: "5px"
        };
    };

    return (
        <div style={errorStackStyle()}>
            <Box style={{
                padding: "10px", backgroundColor: "#FFDD85", borderRadius: "15px", marginTop: "15px",
                marginBottom: "10px", flexBasis: "content", width: "fit-content"
            }}>
                <Stack direction="row" style={{alignItems: "end"}}>
                    <Typography variant="caption" color="#00000099">
                        {
                            title[0].includes("/") ?
                            title[0].substring(0, title[0].lastIndexOf("/")+1):
                            ""
                        }
                    </Typography>
                    <Typography variant="title" style={{marginLeft: "2px"}}>
                        {
                            title[0].includes("/") ?
                            title[0].substring(title[0].lastIndexOf("/")+1) :
                            title[0]
                        }
                    </Typography>
                </Stack>
            </Box>

            <Stack direction="row" sx={{overflowX: "auto"}}>
                {
                    (inputErrors).map((error, index) => (
                        <Button key={index + "button"} fullWidth sx={{ borderRadius: "20px" }} style={{
                            background: "#FFF8E6", display: "flex", flexDirection: "row", textTransform: "none",
                            color: "black", marginRight: "10px", alignItems: "flex-start", width: "150px",
                            flexShrink: 0
                        }}>
                            <Box key={index + "box"} sx={{
                                flexDirection: "row", alignItems: "stretch", width: "100%", overflowX: "wrap",
                                wordBreak: "break-word"
                            }}>
                                {
                                    error.type === "codeQualityIssue" ?
                                        codeQualityIssue :
                                        (error.type === "moderateIssue" ? moderateIssue : majorIssue)
                                }
                                <Typography sx={{lineHeight: "16px", marginBottom: "10px"}} key={index + "title"}>
                                    {error.title}
                                </Typography>
                                <Typography sx={{lineHeight: "14px", marginBottom: "5px", fontSize: "12px"}}
                                            key={index + "description"}>
                                    {error.description}
                                </Typography>
                                <Typography sx={{lineHeight: "14px", marginBottom: "5px", fontSize: "12px"}}
                                            key={index + "errors"}>
                                    {error.lineNumbers.toString()}
                                </Typography>
                            </Box>
                        </Button>
                ))}
            </Stack>
            <Box variant="body1"  color="#000000" bgcolor="#FFF8E6" sx={{
                borderRadius: 4, flexGrow: 1, flexDirection: "column", marginTop: "10px", marginBottom: "10px"
            }}>
                {
                    (code.split("\n")).map((line, index) => (
                        <Stack direction="row" sx={{justifyContent: "center"}}>
                            <code style={{
                                backgroundColor: getLineHighlight(index+1, inputErrors, true),
                                color: lineContainsIssue(index+1, inputErrors) ? "#FFFFFF" : "#000000",
                                textAlign: "center", paddingTop : (index === 0) ? "10px" : 0,
                                width: ((((code.split("\n")).length.toString().length * 10) + 10) + "px"),
                                borderTopLeftRadius : (index === 0 ? "15px" : 0),
                                borderBottomLeftRadius : ((index === ((code.split("\n")).length-1)) ? "15px" : 0),
                                paddingBottom : (index === ((code.split("\n")).length-1)) ? "10px" : 0
                            }}>
                                {index+1}
                            </code>
                            <Button fullWidth style={{
                                display: "flex", flexDirection: "column", padding: "0px", textTransform: "none",
                                color: "black", alignItems: "flex-start", textAlign: "left", paddingLeft: "10px",
                                paddingRight: "10px", paddingTop : (index === 0) ? "10px" : 0, overflowX: "wrap",
                                borderTopLeftRadius : "0px", borderBottomLeftRadius : "0px",
                                paddingBottom : (index === ((code.split("\n")).length-1)) ? "10px" : 0,
                                borderTopRightRadius : (index === 0 ? "15px" : "0px"), wordBreak: "break-word",
                                borderBottomRightRadius : ((index === ((code.split("\n")).length-1)) ? "15px" : "0px"),
                                backgroundColor : getLineHighlight(index+1, inputErrors, false),
                            }}>
                                <code>
                                    {highlightAndFormatWhitespace(line, "js")}
                                </code>
                            </Button>
                        </Stack>
                    ))
                }
                </Box>
        </div>
    )
}

export default Content