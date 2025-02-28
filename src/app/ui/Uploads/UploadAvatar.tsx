import React, {RefObject, useRef, useState} from "react";
import Cropper, {ReactCropperElement} from "react-cropper";
import "cropperjs/dist/cropper.css";

type Props = {
    avatarUrl: string;
    cropperRef: RefObject<ReactCropperElement>
};

export const UploadAvatar: React.FC<Props> = ({
                                                  avatarUrl,
                                                  cropperRef
                                              }) => {

    return (
        <>
            <Cropper
                src={avatarUrl}
                style={{ height: 400, width: "100%" }}
                initialAspectRatio={4 / 3}
                aspectRatio={4 / 3}
                minCropBoxHeight={100}
                minCropBoxWidth={100}
                guides={false}
                ref={cropperRef}
            />
        </>
    );
};