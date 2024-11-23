import { InjectableRxStompConfig } from "@stomp/ng2-stompjs";
import SockJS from "sockjs-client";

export const myRxStompConfig: InjectableRxStompConfig = {
    webSocketFactory: () => {
        return new SockJS('http://localhost:8080/api/testchat');
    },
    
    // Other configuration options
};

export interface Notification
{
    id: string;
    icon?: string;
    image?: string;
    title?: string;
    description?: string;
    time: string;
    link?: string;
    useRouter?: boolean;
    read: boolean;
}
