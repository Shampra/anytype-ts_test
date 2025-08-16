import React, { useState, useEffect, forwardRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-powershell';
import { U } from 'Lib';

interface MediaPs1Props {
    id: string;
    src: string;
    onClick: () => void;
}

const MediaPs1 = forwardRef<any, MediaPs1Props>((props, ref) => {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (props.src) {
            fetch(props.src)
                .then(response => response.text())
                .then(text => {
                    const highlighted = Prism.highlight(text, Prism.languages.powershell, 'powershell');
                    setContent(highlighted);
                });
        }
    }, [props.src]);

    return (
        <div id={props.id} ref={ref} onClick={props.onClick}>
            <pre dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
});

export default MediaPs1;
