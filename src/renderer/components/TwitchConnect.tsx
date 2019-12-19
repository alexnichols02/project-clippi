import * as React from "react";

import styled from "styled-components";
import { HelixUser } from "twitch";

import { createTwitchClip, currentUser, isStreaming } from "../../common/twitch";

const TwitchUserStatus: React.SFC<{ user: HelixUser; live: boolean }> = props => {
    const status = props.live ? "live" : "offline";
    const TwitchStatusContainer = styled.div`
        display: flex;
        background-color: rgba($color: #6441a5, $alpha: 0.8);
        img {
            height: 30px;
            width: 30px;
            padding-right: 5px;
        }
    `;
    const TwitchStatusIndicator = styled.div`
    display: flex;
    align-items: center;
    &::before {
        content: '';
        height: 5px;
        width: 5px;
        background-color: red;
        border-radius: 50%;
        display: inline-block;
        margin-right: 5px;
    }
    &.live::before {
        background-color: rgb(46, 236, 46);
    }
    `;
    return (
        <TwitchStatusContainer>
            <img src={props.user.profilePictureUrl} />
            <TwitchStatusIndicator>{status}</TwitchStatusIndicator>
        </TwitchStatusContainer>
    );
};

export const TwitchClip: React.SFC<{ accessToken: string }> = props => {
    const [name, setName] = React.useState("");
    const [live, setLive] = React.useState(false);
    const [user, setUser] = React.useState<HelixUser | null>(null);
    const handleClip = async () => {
        const clip = await createTwitchClip(props.accessToken, name);
        console.log(`clip: ${clip}`);
    };

    const handleStatus = async () => {
        const userIsLive = await isStreaming(props.accessToken, name);
        console.log(`${name} is live? ${userIsLive}`);
    };

    const checkUser = async () => {
        const u = await currentUser(props.accessToken);
        setUser(u);
    };

    const checkStatus = async () => {
        console.log("checking status");
        const isLive = await isStreaming(props.accessToken);
        console.log(`status: ${isLive}`);
        setLive(isLive);
    };

    React.useEffect(() => {
        (async () => {
            await checkUser();
            await checkStatus();
        })().catch(console.error);
    }, [props, live]);

    return (
        <div>
            {user && <TwitchUserStatus user={user} live={live} />}
            <button
                onClick={() => {
                    checkStatus().catch(console.error);
                }}
            >
                Refresh Status
            </button>
            <form>
                <label>
                    Twitch broadcaster ID:
                    <input type="text" value={name} onChange={e => setName(e.target.value)} />
                </label>
                <button
                    onClick={(e: any) => {
                        e.preventDefault();
                        handleClip().catch(console.error);
                    }}
                >
                    clip
                </button>
                <button
                    onClick={(e: any) => {
                        e.preventDefault();
                        handleStatus().catch(console.error);
                    }}
                >
                    status
                </button>
            </form>
        </div>
    );
};

export const TwitchConnect: React.FC<{
    clickHandler: () => void;
}> = (props) => {
    const size = "32px";
    const twitchColor = "#6441A4";
    const twitchIconImage = require("../styles/images/twitch.svg");
    const TwitchLogo = styled.div`
    background-color: white;
    mask: url(${twitchIconImage}) no-repeat 50% 50%;
    mask-size: cover;
    display: inline-block;
    height: ${size};
    width: ${size};
    `;
    const TwitchButton = styled.button`
    background-color: ${twitchColor};
    color: white;
    `;
    return (
        <TwitchButton onClick={props.clickHandler}>
            <span><TwitchLogo />Connect with Twitch</span>
        </TwitchButton>
    );
};
