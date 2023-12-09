import { NOTIFICATION_CONTAINER, NOTIFICATION_TYPE, Store, iNotification } from 'react-notifications-component'

export const showNotification = async(text: string, _type: string = 'default', timeout: number = 3000) => {
    const notification: iNotification = {
        title: 'Info',
        message: text,
        type: _type as NOTIFICATION_TYPE,
        container: 'bottom-right' as NOTIFICATION_CONTAINER,
        dismiss: {
            duration: timeout
        }
    };
    //Store.addNotification(notification);
}