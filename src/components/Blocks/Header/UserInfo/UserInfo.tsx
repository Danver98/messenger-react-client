import './UserInfo.css';
import { useNavigate } from "react-router-dom";
import { Pages, SecuredPages } from "../../../../util/Constants";
import AuthService from "../../../../services/AuthService";
import { useAuthContextData } from "../../../../middleware/AuthProvider";
import { Box, Button, List, ListItem, ListItemButton, ListItemText, } from "@mui/material";
import User from '../../../../models/User';
import { useState } from 'react';

interface UserInfoOptions {
    id: number | string;
    title: string | null;
    handler: (params?: any | null) => any;
}

const OptionsList = ({ navTo, optionClickHandler, user }:
    { navTo: (destination: any, params?: any) => any, optionClickHandler: (option: UserInfoOptions) => any, user?: User | null }) => {
    const options = [
        {
            id: 1,
            title: 'Edit profile',
            handler: () => {
                navTo(SecuredPages.PROFILE_PAGE);
            }
        },
        {
            id: 2,
            title: 'Settings',
            handler: () => {
                navTo(SecuredPages.SETTINGS);
            }
        }
    ];

    return (
        <Box
            sx={{
                position: 'absolute',
                top: '100%',
                zIndex: 10,
                bgcolor: 'background.paper'
            }}
        >
            <List>
                {
                    options.map((option, index) =>
                        <ListItem
                            key={option.id}
                            disablePadding
                        >
                            <ListItemButton
                                onClick={() => { optionClickHandler(option) }}
                            >
                                <ListItemText
                                    primary={option.title}
                                >

                                </ListItemText>
                            </ListItemButton>
                        </ListItem>
                    )
                }
            </List>
        </Box>
    )
}

export default function UserInfo() {
    //const authContext = useAuthContextData();
    const { user, setUser, getAccessToken, setToken } = useAuthContextData();
    const [optionsOpen, setOptionsOpen] = useState(false);
    const navigate = useNavigate();

    const logout = async () => {
        // At least clear token in storage;
        setToken?.(null);
        setUser?.(null);
        if (!user) {
            return;
        }
        await AuthService.logout(user.id);
        navigate(Pages.LOGIN_PAGE, { replace: true })
    }

    const optionClick = (option: UserInfoOptions) => {
        setOptionsOpen(false);
        option.handler();
    }

    return (
        <>
            {
                user && getAccessToken?.() ?
                    <div className="UserInfo__block">
                        {/* Logged in */}
                        <img
                            className="UserInfo__image-rounded"
                            src={user.avatar}
                            onClick={() => { setOptionsOpen(!optionsOpen) }}
                        />
                        {
                            optionsOpen && <OptionsList navTo={navigate} optionClickHandler={optionClick}/>
                        }
                        <label className="UserInfo__credentials">
                            {user.name + ' ' + user.surname}
                        </label>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => { logout() }}>Logout
                        </Button>
                    </div>
                    :
                    'Not logged'
            }
        </>
    )
}