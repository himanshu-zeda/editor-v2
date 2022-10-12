import React, { RefObject, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, SingleCommands } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Heading } from "@tiptap/extension-heading";
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskItem from '@tiptap/extension-task-item';
import Paragraph from '@tiptap/extension-paragraph';
import { TaskList } from '@tiptap/extension-task-list';
import Strike from '@tiptap/extension-strike';
import OrderedList from '@tiptap/extension-ordered-list';
import Placeholder from '@tiptap/extension-placeholder';
import Italic from '@tiptap/extension-italic';
import { BulletList } from "@tiptap/extension-bullet-list";
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Link from '@tiptap/extension-link';
import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import Bold from '@tiptap/extension-bold';
import Blockquote from '@tiptap/extension-blockquote';
import Underline from '@tiptap/extension-underline'
import Focus from '@tiptap/extension-focus'
import Image from '@tiptap/extension-image'
import { PLACEHOLDERS } from './utils';
import styled from 'styled-components';

interface TiptapContainerProps {
    className: string;
    placeholder?: string;
}

const BubbleMenuContainer = styled.div<{hidden: boolean}>`
    position: absolute;
    height: fit-content;
    width: 150px;
    background: #ffffff;
    border-radius: 3px;
    z-index: 10;
    padding: 8px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    display: ${(({hidden}) => hidden ? 'hidden' : '')};
`;

const BubbleMenuItem = styled.div`
    padding: 8px;
    :hover {
        background: #2d70fd;
        border-radius: 4px;
        cursor: pointer;
        color: #ffffff;
    }
`;

interface NodeType {
    name: string;
    id: string;
    command: string;
    attrs?: any[];
}

const NodeTypes: NodeType[] = [
    {id: 'heading1', command: 'setHeading', name: 'Heading 1', attrs: [{level: 1}]},
    {id: 'heading2',command: 'setHeading', name: 'Heading 2', attrs: [{level: 2}]},
    {id: 'heading3',command: 'setHeading', name: 'Heading 3', attrs: [{level: 3}]},
    {id: 'code',command: 'toggleCodeBlock', name: 'Code'},
    {id: 'bulletlist',command: 'toggleBulletList', name: 'Bullet List'},
    {id: 'orderedlist',command: 'toggleOrderedList', name: 'Ordered List'},
    {id: 'checklist',command: 'toggleTaskList', name: 'Checklist'},
    {id: 'divider',command: 'setHorizontalRule', name: 'Divider'},
    {id: 'link',command: '', name: 'Link'},
    {id: 'image',command: '', name: 'Image'},
    {id: 'files',command: '', name: 'File'},
    {id: 'table',command: 'insertTable', name: 'Table'},
]

const Tiptap = (props: TiptapContainerProps) => {
    
    const editor = useEditor({
        extensions: [
            StarterKit,
            Paragraph,
            Heading.configure({
                levels: [1, 2, 3],
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TaskItem,
            TaskList,
            Underline,
            Strike,
            OrderedList,
            Placeholder.configure({
                includeChildren: true,
                placeholder: ({node, editor}): string => {
                    if (editor.isEmpty) return props.placeholder ?? PLACEHOLDERS.default.placeholder;

                    const parentNodeName = editor.view.state.selection.$from.node(-1)?.type?.name as string;
                    if (parentNodeName.includes('table')) return '';

                    const nodeName = node.type.name as keyof typeof PLACEHOLDERS;
                    
                    return Object.keys(PLACEHOLDERS).includes(node.type.name as string) ?
                        PLACEHOLDERS[nodeName].placeholder : PLACEHOLDERS.default.placeholder;
                }
            }),
            Image,
            Italic,
            Link,
            HorizontalRule,
            Focus,
            BulletList,
            BubbleMenu,
            Bold,
            Blockquote
        ],
        content: `
            <h1>heading</h1>
            <h2>heading</h2>
            <h3>heading</h3>
            <h4>heading</h4>
            <h5>heading</h5>
            <ul>
                <li>Something</li>
                <li>Something</li>
                <li>Something</li>
                <li>Something</li>
                <li>Something</li>
            </ul>
        `,
    });

    const [showToggleMenu, setShowToggleMenu] = useState(false);
    const toggleMenuRef = useRef<HTMLDivElement | null>(null);
    const handler = () => setShowToggleMenu(false);
    
    useOnClickOutside(toggleMenuRef, handler);

    const onKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === '/') {
            setShowToggleMenu(true);
            return;
        }
        setShowToggleMenu(false);
    }

    const handleMenuNodeCreation = (menuNode: NodeType) => {
        setShowToggleMenu(false);
		const { command, attrs = [] } = menuNode;
        if (command && editor) {
            // editor.commands[command](...attrs);
            console.log(command);
        }
    }

    return (
        <>
            <BubbleMenuContainer hidden={!showToggleMenu} ref={toggleMenuRef}>
                {NodeTypes.map((item: NodeType, index: number) => (
                    <BubbleMenuItem key={`${item.name}_${index}`} onClick={() => handleMenuNodeCreation(item)}>{item.name}</BubbleMenuItem>
                ))}
            </BubbleMenuContainer>
            <EditorContent editor={editor} className={props.className} onKeyDown={onKeyUp} />
        </>
    )
}

const useOnClickOutside = (ref: RefObject<HTMLElement>, handler: () => void) => {
    useEffect(() => {
        const listener = (event: any) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }

            handler();
        }

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        }
    }, [ref, handler]);
}

export default Tiptap;