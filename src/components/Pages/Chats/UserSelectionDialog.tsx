import { Button, Checkbox, Dialog, InputAdornment, ListItemAvatar, TextField } from "@mui/material";
import "./ChatRoom.css";
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import User from "../../../models/User";
import { useCallback, useEffect, useMemo, useState } from "react";
import UserService, { UserRequestDTO } from "../../../services/UserService";
import { Avatar } from "react-lorem-ipsum";
import Chat from "../../../models/Chat";
import MessengerService from "../../../services/MessengerService";
import { ID } from "../../../util/Types";

const SearchBar = ({ onChange }: { onChange: (value: string) => any }) => {
    return (
        <TextField
            id="standard-basic"
            label="Enter user credentials"
            variant="standard"
            fullWidth
            margin="normal"
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
            onChange={(e: any) => {
                onChange(e.target.value)
            }}
        />
    )
}

const UserList = ({ users, checked, handleToggle }: { users: User[], checked: number[], handleToggle: (position: number, userId: ID) => any }) => {
    if (users == null || users.length === 0) {
        return (
            <>
                No users found!
            </>
        )
    }
    return (
        <Box >
            <List>
                {
                    users.map((user, index) =>
                        <ListItem
                            key={user.id}
                            secondaryAction={
                                <Checkbox
                                    checked={checked.includes(index)}
                                    onChange={(event) => handleToggle(index, user.id)}
                                />
                            }
                        >
                            <ListItemAvatar >
                                <Avatar src={user.avatar} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={user.name + ' ' + user.surname}
                            >
                            </ListItemText>
                        </ListItem>
                    )
                }
            </List>
        </Box>
    )
}

const UserSelectionDialog = ({ user, chat }: { user?: User | null, chat: Chat }) => {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [checked, setChecked] = useState([1]);
    const [selectedUsers, setSelectedUsers] = useState<ID[]>([]);

    const handleToggle = (position: number, userId: ID) => {
        const currentIndex = checked.indexOf(position);
        const newChecked = [...checked];
        let newSelectedUsers = [...selectedUsers];

        if (currentIndex === -1) {
            newChecked.push(position);
            newSelectedUsers.push(userId);
        } else {
            newChecked.splice(currentIndex, 1);
            newSelectedUsers = newSelectedUsers.filter((id) => id !== userId);
        }

        setChecked(newChecked);
        setSelectedUsers(newSelectedUsers);
    };

    const handleClickOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handeClickClose = useCallback(() => {
        setOpen(false)
    }, []);

    const addUsers = useCallback(async () => {
        MessengerService.addUsersToChat(chat.id, selectedUsers);
    }, [selectedUsers, chat.id]);

    const abortController = useMemo(() => {
        return new AbortController();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!open) return;
            if (search) {
                // In case of search is present start requesting from 3 symbols-lenght string
                if (search.length > 2) {
                    const data = await UserService.list(dto, abortController);
                    setUsers(data);
                }
            } else {
                const data = await UserService.list(dto, abortController);
                // Check if answer contains data
                setUsers(data);
            }
        }
        // If we've already started a new request, cancel it
        const dto: UserRequestDTO = {
            filter: {
                search: search
            }
        }

        fetchUsers();

        return () => {
            //abortController.abort();
        };

    }, [open, search])

    return (
        <div className="">
            {
                !chat.private &&
                <Button variant="outlined" onClick={handleClickOpen}>
                    Add participants
                </Button>
            }
            <Dialog
                open={open}
                onClose={() => handeClickClose()}
            >
                <div className="participant-selection-popup">
                    <div className="participant-selection-popup-content-wrapper">
                        <div className="participant-selection-popup__SearchBar">
                            <SearchBar
                                onChange={setSearch}
                            />
                        </div>
                        <div className="participant-selection-popup__UserList">
                            <UserList
                                users={users}
                                checked={checked}
                                handleToggle={handleToggle}
                            />
                        </div>
                        <div className="participant-selection-popup__Confirmation">
                            <div className="">
                                <Button
                                    variant="contained"
                                    onClick={() => { }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    disabled={checked.length === 0}
                                    onClick={() => addUsers()}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
};
export default UserSelectionDialog;