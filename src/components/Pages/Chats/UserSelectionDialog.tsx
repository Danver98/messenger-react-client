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

const UserList = ({ users, checked, handleToggle }: { users: User[], checked: number[], handleToggle: (value: number) => any }) => {
    if (users == null || users.length == 0) {
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
                                    onChange={(event) => handleToggle(index)}
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

const UserSelectionDialog = ({chat}: {chat: Chat}) => {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [checked, setChecked] = useState([1]);
    const handleToggle = (position: number) => {
        const currentIndex = checked.indexOf(position);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(position);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const handleClickOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handeCLickClose = useCallback(() => {
        setOpen(false)
    }, []);

    const addUsers = useCallback(async () => {
        const ids = users.map((user) => user.id);
        MessengerService.addUsersToChat(chat.id, ids);
    }, []);

    const abortController = useMemo(() => {
        return new AbortController();
    }, []);



    useEffect(() => {
        const fetchUsers = async () => {
            console.log(`useEffect() with fetchUsers() called! search: ${search}, open: ${open}. Will be called: ${open}`);
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
            console.log(`USE_EFFECT RETURN CALLED: from UserSelectionDialog.fetchUsers()`)
            //abortController.abort();
        };

    }, [open, search])

    return (
        <div className="">
            <Button variant="outlined" onClick={handleClickOpen}>
                Add participants
            </Button>
            <Dialog
                open={open}
                onClose={() => handeCLickClose()}
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