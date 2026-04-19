import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import { IconButton } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from "react-router-dom";
import { useStompClient } from "react-stomp-hooks";
import MessengerService from '../../../services/MessengerService';
import Chat from '../../../models/Chat';
import User from '../../../models/User';
import { SecuredPages } from '../../../util/Constants';
import UserSelector from './UserSelector';
import { ID } from '../../../util/Types';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
        ...theme.applyStyles('dark', {
          color: 'inherit',
        }),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}));

export default function ChatRoomMenu({chat, user}: {chat: Chat, user?: User | null}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [userSelectorOpen, setUserSelectorOpen] = React.useState(false);
  const stompClient = useStompClient();
  const navigate = useNavigate();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setUserSelectorOpen(false);
  };

  const addParticipants = React.useCallback(() => {
    handleClose();
    setUserSelectorOpen(true);
  }, []);

  const addUsersToChat = React.useCallback(async (selectedUsers: ID[]) => {
    await MessengerService.addUsersToChat(chat.id, selectedUsers);
  }, [chat.id]);

  const leaveChat = React.useCallback(async () => {
    if (!user?.id) return;
    await MessengerService.deleteUsersFromChat(chat.id, [user.id]);
    if (!chat.private) {
      stompClient?.unsubscribe(`/topic/chats/${chat.id}/messages`);
    }
    handleClose();
    navigate(SecuredPages.CHATS_PAGE, { replace: true });
  }, [chat.id, chat.private, user?.id, stompClient, navigate]);

  return (
    <div>
      <IconButton onClick={handleClick}>
        <MenuIcon />
      </IconButton>
      <StyledMenu
        id="demo-customized-menu"
        slotProps={{
          list: {
            'aria-labelledby': 'demo-customized-button',
          },
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {
          !chat.private &&
          <MenuItem onClick={addParticipants} disableRipple>
            <PersonAddIcon />
            Add participants
          </MenuItem>
        }
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={leaveChat} disableRipple>
          <LogoutIcon />
          Leave chat
        </MenuItem>
      </StyledMenu>
        <UserSelector isOpen={userSelectorOpen} onResult={addUsersToChat} />
    </div>
  );
}
