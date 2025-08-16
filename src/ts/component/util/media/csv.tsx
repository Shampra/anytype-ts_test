import React, { useState, useEffect, forwardRef } from 'react';
import { U } from 'Lib';

interface MediaCsvProps {
    id: string;
    src: string;
    onClick: () => void;
}

const MediaCsv = forwardRef<any, MediaCsvProps>((props, ref) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        if (props.src) {
            fetch(props.src)
                .then(response => response.text())
                .then(text => {
                    const rows = text.split('\\n').map(row => row.split(','));
                    setData(rows);
                });
        }
    }, [props.src]);

    return (
        <div id={props.id} ref={ref} onClick={props.onClick}>
            <table>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default MediaCsv;
