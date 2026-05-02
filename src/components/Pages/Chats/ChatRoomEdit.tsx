import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Chat from '../../../models/Chat';
import User from '../../../models/User';
import { ID } from '../../../util/Types';
import MessengerService from '../../../services/MessengerService';
import { Avatar, FormControlLabel, Switch } from '@mui/material';
import { Permissions } from '../../../models/Permissions';
import "./Chats.css";

export default function ChatRoomEdit({ isOpen = false, chatId, user, permissions, onResult = () => {} }:
    { isOpen: boolean, chatId: ID, user?: User | null, permissions?: string[], onResult?: () => void }) {
    const [open, setOpen] = React.useState(isOpen);
    const [readOnly, setReadOnly] = React.useState(true);
    const [chat, setChat] = React.useState<Chat | null>(null);

    const handleClose = () => {
        setReadOnly(true);
        setOpen(false);
        onResult()
    };

    React.useEffect(() => {
        setOpen(isOpen);
    }, [isOpen]);

    React.useEffect(() => {
        const fetchChat = async (id: ID) => {
            const data = await MessengerService.getChat(id, user?.id);
            setChat(data);
        }
        if (open) {
            fetchChat(chatId);
        }
    }, [chatId, user?.id, open]);

    const handleChange = React.useCallback(<K extends keyof Chat>(value: any, field: K) => {
        if (!chat) return;
        const chatCopy: Chat = chat.copy();
        chatCopy[field] = value;
        setChat(chatCopy);
    }, [chat]);

    const handleSubmit = (event: any) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        const email = formJson.email;
        console.log(email);
        handleClose();
    };

    const saveHandler = async () => {
        if (!readOnly && chat) {
            await MessengerService.updateChatPatch(chat);
            handleClose();
        }
        setReadOnly(!readOnly);
    }

    return (
        <React.Fragment>
            <Dialog open={open} onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 5,
                            width: '40%',
                            height: '70%',
                        }
                    }
                }}
            >
                <DialogContent className="chat-room-edit">
                    <form onSubmit={handleSubmit} id="subscription-form" className="chat-room-edit__form">
                        <Avatar
                            alt="Chat avatar image"
                            src={chat && chat?.avatar ? chat.avatar : undefined}
                            sx={{
                                width: 180,
                                height: 180,
                                marginBottom: 1
                            }}
                        />
                        <TextField
                            required
                            margin="dense"
                            id="name"
                            name="name"
                            label="Name"
                            variant="standard"
                            disabled={readOnly}
                            value={chat?.name}
                            onChange={(event: any) => {
                                handleChange(event.target.value, 'name');
                            }}
                            sx={{
                                width: '50%'
                            }}
                            className="chat-room-edit__NameField"
                        />
                        <FormControlLabel
                            control={<Switch
                                checked={chat?.canAddUsers}
                                disabled={readOnly}
                                onChange={(event: any) => {
                                    handleChange(event.target.checked, 'canAddUsers');
                                }}
                            />}
                            label="Users can add members"
                        />
                    </form>
                </DialogContent>
                <DialogActions className="chat-room-edit--dialogActions"
                    sx={{
                        margin: 1
                    }}
                >
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        type={readOnly ? "button" : "submit"}
                        size="small"
                        variant="contained"
                        disabled={!permissions?.includes(Permissions.Chat.ADMIN)}
                        onClick={() => { saveHandler() }}>{
                            readOnly ? 'Edit' : 'Save'
                        }
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
