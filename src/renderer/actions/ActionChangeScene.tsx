import * as React from "react";

import { ActionTypeGenerator } from "@vinceau/event-actions";
import { produce } from "immer";
import { useSelector } from "react-redux";
import { Button } from "semantic-ui-react";

import { InlineDropdown, SimpleInput } from "@/components/Misc/InlineInputs";
import { CustomIcon } from "@/components/Misc/Misc";
import { connectToOBSAndNotify, getAllScenes, setScene } from "@/lib/obs";
import { delay as waitMillis, notify } from "@/lib/utils";
import { iRootState } from "@/store";
import { ActionComponent } from "./types";

import obsIcon from "@/styles/images/obs.svg";

interface ActionChangeSceneParams {
    scene: string;
    delay?: string;  // delay in milliseconds string
}

export const DelayInput: React.FC<{
    value?: string;
    onChange: (delay: string) => void;
}> = props => {
    const [delayAmount, setDelayAmount] = React.useState(props.value || "0");
    return (
        <div style={{padding: "5px 0"}}>
            <span>After waiting </span>
            <SimpleInput
                style={{width: "100px"}}
                value={delayAmount}
                onBlur={() => props.onChange(delayAmount)}
                onChange={(e) => setDelayAmount(e.target.value)}
                placeholder="2500"
            />
            <span> milliseconds</span>
        </div>
    );
};

const actionChangeScene: ActionTypeGenerator = (params: ActionChangeSceneParams) => {
    return async (): Promise<void> => {
        try {
            const millis = parseInt(params.delay || "0", 10);
            if (millis > 0) {
                await waitMillis(millis);
            }
            await setScene(params.scene);
        } catch (err) {
            console.error(err);
            notify("Could not change scene. Are you connected to OBS?");
        }
    };
};

const ActionIcon = () => {
    return (
        <CustomIcon size={20} image={obsIcon} color="black" />
    );
};

const SceneNameInput = (props: any) => {
    const { value, onChange } = props;
    const { obsConnected } = useSelector((state: iRootState) => state.tempContainer);
    if (!obsConnected) {
        return (
            <Button content={`Connect to OBS`} type="button" onClick={connectToOBSAndNotify} />
        );
    }

    const allScenes = getAllScenes();
    if (allScenes.length === 0) {
        return (<div>No scene items found.</div>);
    }

    const onSceneChange = (scene: string) => {
        const newValue = produce(value, (draft: ActionChangeSceneParams) => {
            draft.scene = scene;
        });
        onChange(newValue);
    };

    const onDelayChange = (delay: string) => {
        const newValue = produce(value, (draft: ActionChangeSceneParams) => {
            draft.delay = delay;
        });
        onChange(newValue);
    };

    return (
        <div>
            <InlineDropdown
                value={value.scene}
                prefix="Scene: "
                onChange={onSceneChange}
                customOptions={allScenes}
            />
            <DelayInput value={value.delay} onChange={onDelayChange} />
        </div>
    );
};

export const ActionChangeScene: ActionComponent = {
    label: "change OBS scene",
    action: actionChangeScene,
    Icon: ActionIcon,
    Component: SceneNameInput,
};
