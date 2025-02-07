import React from 'react'
import {Box,Stack, Typography} from "@mui/material";
import scilLogo from "./resources/Scil.svg";

const Home = () => {
    return (
        <>
            <Stack flexGrow={1} height="300px" >
                <Box variant="body1" color="#000000" bgcolor="#FFF8E6"
                     sx={{borderRadius: 4, flexGrow: 1, flexDirection: "column", margin: "5px", padding: "15px"}}>
                    <Stack direction="row">
                        <Stack direction="column" sx={{flexGrow: 1, justifyContent: "center"}}>
                            <Typography fontSize="32px" display="inline" sx={{
                                lineHeight: "32px",
                                marginBottom: "15px"
                            }}>Hello, welcome to Scil!</Typography>
                            <Typography fontSize="16px" display="inline" sx={{
                                lineHeight: "16px",
                                marginBottom: "15px"
                            }}>Researching the impact of LLMs code analysis for code repositories.</Typography>
                        </Stack>
                        <img src={scilLogo} style={{height: "150px", margin: "70px"}} alt="Scil"/>
                    </Stack>
                </Box>
            </Stack>
            <Box color="#000000" bgcolor="#FFF8E6" sx={{borderRadius: 4, flexGrow: 1, flexDirection: "column",
                padding: "15px", marginTop: "35px", marginBottom: "5px", marginLeft: "5px", marginRight: "5px"}}>
                <Stack>
                    <Box>
                        <Typography variant="h6" display="inline" sx={{
                            lineHeight: "32px", marginBottom: "15px"
                        }}>
                            How to use Scil
                        </Typography>
                    </Box>
                    <Typography variant="body1" display="inline" sx={{
                        lineHeight: "24px",
                        marginBottom: "15px"
                    }}>
                        Before getting setup, contact Darragh Clifford at dcliffor@tcd.ie to obtain the consent form. You must complete this form before using the application.<br/>
                        If you are using Scil with GitLab, click on the Login button in the top right. You will be prompted to enter a GitLab private key.
                        To obtain this, navigate to https://gitlab.scss.tcd.ie/ and click on your profile picture, then Preferences. From here, navigate to Access Tokens and add new token.
                        Give the token a memorable name and ensure you set the expiration date to a date that falls after you intend to discontinue using Scil. You must grant the token api, read_api, read_user and read_repository scopes.
                        You can then create the token, you should then store it in a secure location. Copy this token into the dialogue within Scil. Once you click update, you should see that your name and username appear alongside your profile photo in the header.<br/>
                    </Typography>
                </Stack>
            </Box>
            <Box color="#000000" bgcolor="#FFF8E6" sx={{borderRadius: 4, flexGrow: 1, flexDirection: "column",
                padding: "15px", marginTop: "5px", marginBottom: "5px", marginLeft: "5px", marginRight: "5px"}}>
                <Stack>
                    <Box>
                        <Typography variant="h6" display="inline" sx={{lineHeight: "32px", marginBottom: "15px"}}>
                            Consent
                        </Typography>
                    </Box>
                    <Typography variant="body1" display="inline" sx={{
                        lineHeight: "24px",
                        marginBottom: "15px"
                    }}>
                        By using Scil, you must have completed a consent form that outlines the following terms. I voluntarily agree to participate in this Final Year Project.<br/>
                        I understand that even if I agree to participate now, I can withdraw at any time or
                        refuse to answer any question without any consequences of any kind.<br/>
                        I understand that I can withdraw permission to use data from any meetings with the
                        Principal Investigator (Darragh Clifford), any meeting (e.g. scrum) recordings, any code
                        provided (even publicly available) and any other data regarding my assessments at any
                        point, in which case the material will be deleted.<br/>
                        I have had the purpose and nature of the study explained to me in writing and I have had
                        the opportunity to ask questions about the study.<br/>
                        I understand that participation involves the collection of my code, either sent directly
                        to the Primary Investigator via email or obtained with my permission from GitHub, GitLab
                        or other code repositories. This will be used to assess my coding abilities, skills and,
                        where relevant, collaboration metrics. The results of my assessment will be accessible
                        only by the Principal Investigator, myself and, where applicable, collaboration metrics
                        will be accessible by all team members. These results will not be shared with anyone
                        involved in the grading of my projects and will not have an impact on my academic
                        record. The code may be retained securely in OneDrive until the completion of the
                        project.<br/>
                        If everyone including myself consents to the collection of scrum meeting recordings,
                        this data will be held for the duration of the project. Disguised extracts from my
                        interview may be quoted in the Principal Investigator’s project and will be retained for
                        up to two years from the date of the exam board. This will be used exclusively for the
                        assessment of the performance of the Principal Investigator’s service. I will be
                        notified if my disguised extract is included in the report. Such data will be retained
                        securely in OneDrive.<br/>
                        If everyone including myself consents to the collection of other data from GitHub,
                        GitLab or other code repositories, data such as tickets and their content, Kanban board
                        information and commit history will be collected to assess collaboration metrics and
                        further skills analysis. This data will be retained until the completion of the project
                        and will be retained securely in OneDrive.<br/>
                        Data from GitHub, GitLab or other code repositories may be sent to AI/LLMs for enhanced
                        analysis of code quality, skills and, where relevant, collaboration metrics. Such data
                        will be anonymised and I will not be identifiable from the data sent to such
                        services.<br/>
                        NB: Do not add any personally identifiable data to your code. If you do, personally
                        identifiable data may be sent to such AI/LLMs. Your name and email, tied to each commit,
                        will be removed where data is sent.<br/>
                        I understand that I will not benefit directly from participating in this research.<br/>
                        I agree to my meeting and subsequent meetings being audio-recorded.<br/>
                        I understand that all information I provide for this study will be treated
                        confidentially.<br/>
                        I understand that in any report on the results of this research my identity will remain
                        anonymous. This will be done by changing my name and disguising any details of my
                        interview which may reveal my identity or the identity of people I speak about.<br/>
                        I understand that disguised extracts from my meeting(s) may be quoted in the Principal
                        Investigator’s project, and may be discussed with the Project Supervisor (Inmaculada
                        Arnedillo-Sánchez) without revealing my identity or the identity of people I speak
                        about.<br/>
                        I understand that if I inform the Principal Investigator that myself or someone else is
                        at risk of harm they may have to report this to the relevant authorities - they will
                        discuss this with me first but may be required to report with or without my
                        permission.<br/>
                        I understand that signed consent forms and original audio recordings will be retained in
                        OneDrive, accessible only by the Principal Investigator until I withdraw my permission
                        to use my data, my project is completed or the Final Year Project is completed.<br/>
                        I understand that disguised extracts from my meeting(s) without identifying information
                        may be included in the Principal Investigator’s Final Year Project will be retained for
                        up to two years from the date of the exam board.<br/>
                        I understand that under freedom of information legalisation I am entitled to access the
                        information I have provided at any time while it is in storage as specified above.<br/>
                        I understand that I am free to contact any of the people involved in the research to
                        seek further clarification and information, contact information is shown
                        below.<br/><br/>

                        Principal Investigator – Darragh Clifford – dcliffor@tcd.ie<br/>
                        Supervisor – Inmaculada Arnedillo-Sánchez – arnedii@tcd.ie<br/><br/>
                        We hope that you enjoy using Scil!
                    </Typography>
                </Stack>
            </Box>
        </>
    )
}
export default Home