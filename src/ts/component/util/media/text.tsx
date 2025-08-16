import React, { useState, useEffect, forwardRef } from 'react';
import { U } from 'Lib';

interface MediaTextProps {
    id: string;
    src: string;
    onClick: () => void;
}

const MediaText = forwardRef<any, MediaTextProps>((props, ref) => {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (props.src) {
            fetch(props.src)
                .then(response => response.text())
                .then(text => setContent(text));
        }
    }, [props.src]);

    return (
        <div id={props.id} ref={ref} onClick={props.onClick}>
            <pre>{content}</pre>
        </div>
    );
});

export default MediaText;
