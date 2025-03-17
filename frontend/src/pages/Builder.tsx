import React from  'react';
import { useLocation } from 'react-router-dom';
import { Monaco } from '@monaco-editor/react';
import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';
import { Step } from '../types';
import { StepType } from '../types';

const MOCK_FILE_CONTENT = `// This is a sample file content
import React from 'react';

function Component() {
  return <div>Hello World</div>;
}

export default Component;`;

export function Builder(){

    const location = useLocation();
    const {prompt} = location.state as {prompt: string};
    const [usePrompt, setPrompt] = useState("")
    const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string}[]>([]);
    const [loading, setLoading] = useState(false);
    const [templateSet, setTemplateSet] = useState(false);
    const webContainer = useWebContainer();

    const [currentStep, setCurrentStep] = useState(1);
    const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [steps, setSteps] = useState<Step[]>([]);

    const [files, setFiles] = useState<FileItem[]>([]);

    useEffect(() =>{

        let originalFiles = [...files];
        let updateHappened = false;

        steps.filter(({status}) => status === "pending").map(step => {
            updateHappened = true;
            if(step?.type === StepType.CreateFile){
                let parsedPath = step.path?.split("/") ?? [];
                let currentFileStructure = [...originalFiles];
                let finalAnswerRef = currentFileStructure;

                let currentFolder = "";

                while (parsedPath.length){
                    currentFolder = `${currentFolder}/${parsedPath[0]}`;
                    let currentFolderName = parsedPath[0];
                    parsedPath = parsedPath.slice(1);

                    if(!parsedPath.length){
                        let file = currentFileStructure.find(f => f.path === currentFolder);
                        if (!file){
                            currentFileStructure.push({
                                name: currentFolderName,
                                type: 'file',
                                path: currentFolder,
                                content: step.code
                            })
                        }
                        else{
                            file.content = step.code
                        }
                    }
                    else{

                        currentFileStructure.push({
                            name: currentFolderName,
                            type: 'folder',
                            path: currentFolder,
                            content: ""
                        })

                        currentFileStructure = currentFileStructure.find(f => f.path === currentFolder)?.children ?? [];
                    

                    }
            }  
            originalFiles = finalAnswerRef;   

            }
        })

        if(updateHappened){
            setFiles(originalFiles);
            setSteps(steps => steps.map((s: Step) => {
                return {
                    ...s,
                    status: "completed"
                }
            }))
        }
        console.log(files);

    }, [steps, files]);



}




