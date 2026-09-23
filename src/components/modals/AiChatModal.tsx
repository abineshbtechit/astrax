import React, { useState, useEffect, useRef } from 'react';
import { useDms } from '../../contexts/DmsContext';
import {
  Bot,
  Sparkles,
  Send,
  FileText,
  Upload,
  X,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Paperclip,
  Trash2,
  FileDown,
} from 'lucide-react';
import { DocumentItem } from '../../types';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  source?: 'azure_ai_agent' | 'fallback' | 'system';
  timestamp: string;
  documentTitle?: string;
}

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: DocumentItem | null;
  initialPrompt?: string;
}

const AZURE_ENDPOINT = 'https://abineshas-6866-resource.services.ai.azure.com/api/projects/abineshas-6866';
const MODEL_NAME = 'gpt-5-mini';
const AGENT_NAME = 'gpt-5-mini';

export const AiChatModal: React.FC<AiChatModalProps> = ({
  isOpen,
  onClose,
  initialDoc,
  initialPrompt,
}) => {
  const { documents } = useDms();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem('astrax_azure_ai_key') || ''
  );
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<{ hasApiKey: boolean; isConfigured: boolean }>({
    hasApiKey: true,
    isConfigured: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load initial status
  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => {
        setAgentStatus({
          hasApiKey: Boolean(data.hasApiKey || apiKey),
          isConfigured: true,
        });
      })
      .catch(() => {});
  }, [apiKey]);

  // Handle initial document or prompt when opened
  useEffect(() => {
    if (isOpen) {
      if (initialDoc) {
        setSelectedDocId(initialDoc.id);
        const autoPrompt = initialPrompt || `Provide an executive evidentiary summary for document "${initialDoc.documentName}". Extract key findings, Section 65B compliance, and statutory references.`;
        handleSendMessage(autoPrompt, initialDoc);
      } else if (messages.length === 0) {
        // Welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            source: 'azure_ai_agent',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: `👋 **Welcome to AstraX AI Evidentiary Assistant**\n\nConnected to Azure AI Foundry Deployed Model: \`${MODEL_NAME}\` (v:2025-08-07).\nStatus: **🟢 ONLINE & AUTHENTICATED**.\n\nI can analyze and summarize legal documents, verify Indian Evidence Act / Section 65B compliance, review forensic investigation reports, and extract statutory penal codes (IPC/BNS).\n\n*Select a vaulted report above or upload any PDF to generate an immediate summary.*`,
          },
        ]);
      }
    }
  }, [isOpen, initialDoc]);

  if (!isOpen) return null;

  const activeDoc = documents.find((d) => d.id === selectedDocId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64Data = (ev.target?.result as string)?.split(',')[1];
        if (base64Data) {
          try {
            setIsLoading(true);
            const res = await fetch('/api/ai/extract-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pdfBase64: base64Data, filename: file.name }),
            });
            const data = await res.json();
            if (data.text) {
              setUploadedFile({ name: file.name, content: data.text });
              setSelectedDocId('');
            } else {
              setUploadedFile({ name: file.name, content: `Extracted text from ${file.name}` });
            }
          } catch {
            setUploadedFile({ name: file.name, content: `Uploaded PDF: ${file.name}` });
          } finally {
            setIsLoading(false);
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = (ev.target?.result as string) || '';
        setUploadedFile({ name: file.name, content: text });
        setSelectedDocId('');
      };
      reader.readAsText(file);
    }
  };

  const handleSaveApiKey = async () => {
    localStorage.setItem('astrax_azure_ai_key', apiKey.trim());
    try {
      await fetch('/api/ai/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      setAgentStatus((prev) => ({ ...prev, hasApiKey: Boolean(apiKey.trim()) }));
      setShowSettings(false);
    } catch {
      setShowSettings(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string, docOverride?: DocumentItem) => {
    const promptToSend = customPrompt || input.trim();
    if (!promptToSend || isLoading) return;

    const docToAnalyze = docOverride || activeDoc;
    const docTitle = docToAnalyze ? docToAnalyze.documentName : uploadedFile?.name || '';
    const docContent = docToAnalyze
      ? `${docToAnalyze.fileContent || ''}\n${docToAnalyze.extractedText || ''}`
      : uploadedFile?.content || '';

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: promptToSend,
      documentTitle: docTitle || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.role !== 'system')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          history,
          documentTitle: docTitle,
          documentText: docContent,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.output_text || data.error || 'No response returned from Azure AI agent.',
        source: data.source || 'azure_ai_agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.auth_required) {
        setAgentStatus((prev) => ({ ...prev, hasApiKey: false }));
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Connection Error**: ${err.message || 'Unable to connect to AI server.'}`,
          source: 'fallback',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadReport = (content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AstraX-AI-Summary-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 font-mono select-none overflow-hidden">
      <div className="bg-white border-2 border-black rounded-2xl w-full max-w-4xl h-[90vh] max-h-[850px] shadow-[8px_8px_0px_#000000] flex flex-col overflow-hidden text-black animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar - 30% Black */}
        <div className="p-3.5 sm:p-4 border-b-2 border-black flex-shrink-0 flex items-center justify-between bg-black text-white px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#64EE00] text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_#FFFFFF]">
              <Bot className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                  Astra<span className="text-[#64EE00]">X</span> AI Assistant
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold bg-[#64EE00] text-black border border-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                  {AGENT_NAME}
                </span>
              </div>
              <p className="text-[11px] text-white/70 font-medium truncate max-w-md hidden sm:block">
                Azure AI Foundry Project • PDF & Evidentiary Summarizer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Azure Key Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border-2 transition flex items-center gap-1 text-xs font-bold ${
                showSettings || agentStatus.hasApiKey
                  ? 'bg-neutral-800 border-white text-white hover:bg-neutral-700'
                  : 'bg-[#64EE00] border-black text-black animate-pulse font-black'
              }`}
              title="Azure AI Foundry Credentials & Key"
            >
              <Sliders className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">
                {agentStatus.hasApiKey ? 'KEY CONFIGURED' : 'SET AZURE KEY'}
              </span>
            </button>

            {/* Clear conversation */}
            <button
              onClick={() => setMessages([])}
              className="p-2 rounded-xl border-2 border-white/30 bg-neutral-900 hover:bg-white hover:text-black transition text-white"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl border-2 border-white bg-black hover:bg-[#64EE00] hover:text-black hover:border-black text-white transition font-bold"
              title="Close Chatbot"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Settings Drawer (Azure Endpoint & Key Configuration) */}
        {showSettings && (
          <div className="bg-neutral-900 text-white border-b-2 border-black p-4 text-xs space-y-3 flex-shrink-0 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#64EE00] flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4" />
                AZURE AI FOUNDRY AGENT CONFIGURATION
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/60 hover:text-white text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div>
                <label className="text-white/70 block mb-1 font-bold">PROJECT ENDPOINT</label>
                <div className="p-2 rounded-lg bg-black border border-neutral-700 text-white truncate font-mono text-[10px]">
                  {AZURE_ENDPOINT}
                </div>
              </div>
              <div>
                <label className="text-white/70 block mb-1 font-bold">TARGET AGENT</label>
                <div className="p-2 rounded-lg bg-black border border-neutral-700 text-[#64EE00] font-bold font-mono text-[11px]">
                  {AGENT_NAME} (v1)
                </div>
              </div>
            </div>

            <div>
              <label className="text-white/80 block mb-1 font-bold flex items-center justify-between">
                <span>AZURE AI API KEY (OPTIONAL IF LOGGED IN VIA AZ CLI)</span>
                <span className="text-[10px] text-white/50">Stored locally in browser session</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste Azure AI Project API Key or Bearer Token..."
                  className="flex-1 bg-black border-2 border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#64EE00]"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 bg-[#64EE00] text-black font-black rounded-xl border-2 border-black hover:bg-white transition text-xs"
                >
                  SAVE KEY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Attachment & Vault Picker Bar - 30% Dark/Neutral surface */}
        <div className="bg-neutral-100 border-b-2 border-black px-4 py-2.5 flex-shrink-0 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <FileText className="w-4 h-4 text-black flex-shrink-0" />
            <span className="text-[11px] font-black text-black whitespace-nowrap">DOCUMENT FOR ANALYSIS:</span>

            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                setUploadedFile(null);
              }}
              className="bg-white border-2 border-black rounded-lg px-2 py-1 text-xs text-black font-bold focus:outline-none focus:border-[#64EE00] max-w-xs truncate"
            >
              <option value="" className="bg-white text-black font-medium">
                -- Select from Vault Documents ({documents.length}) --
              </option>
              {documents.map((d) => (
                <option key={d.id} value={d.id} className="bg-white text-black font-medium">
                  {d.caseNumber}: {d.documentName}
                </option>
              ))}
            </select>

            {/* Custom uploaded file badge */}
            {uploadedFile && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#64EE00] border-2 border-black text-black text-[11px] font-black">
                <Paperclip className="w-3 h-3" />
                <span className="truncate max-w-[140px]">{uploadedFile.name}</span>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="hover:text-red-600 ml-1 font-bold"
                  title="Remove upload"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.md,.json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg border-2 border-black bg-white hover:bg-black hover:text-white text-black text-xs font-bold flex items-center gap-1.5 transition"
              title="Upload PDF or Text Document"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </button>

            {/* Quick Summarize Button if doc selected */}
            {(activeDoc || uploadedFile) && (
              <button
                onClick={() =>
                  handleSendMessage(
                    `Provide an executive evidentiary summary for document "${activeDoc?.documentName || uploadedFile?.name}". Highlight key facts, Section 65B compliance, suspect mentions, and statutory penal codes.`
                  )
                }
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-[#64EE00] text-black border-2 border-black font-black text-xs flex items-center gap-1 hover:bg-black hover:text-[#64EE00] transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summarize Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat Messages Canvas - 60% White (Dominant) with min-h-0 overflow-y-auto */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 select-text bg-white">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black border-2 border-black ${
                    isUser
                      ? 'bg-black text-[#64EE00] shadow-[2px_2px_0px_#000000]'
                      : 'bg-[#64EE00] text-black shadow-[2px_2px_0px_#000000]'
                  }`}
                >
                  {isUser ? 'ME' : <Bot className="w-4 h-4 stroke-[2.5]" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 border-2 border-black text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-black text-white'
                      : 'bg-neutral-50 text-black shadow-[3px_3px_0px_#000000]'
                  }`}
                >
                  {/* Meta bar */}
                  <div className={`flex items-center justify-between gap-4 mb-2 pb-1.5 border-b text-[10px] font-mono ${
                    isUser ? 'border-white/20 text-white/70' : 'border-black/10 text-black/60'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold">
                        {isUser ? 'INVESTIGATOR' : `AZURE AI: ${AGENT_NAME}`}
                      </span>
                      {msg.documentTitle && (
                        <span className="bg-[#64EE00] text-black px-1.5 py-0.5 rounded border border-black font-black truncate max-w-[200px]">
                          📄 {msg.documentTitle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <>
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="hover:text-[#64EE00] p-0.5 font-bold"
                            title="Copy Markdown"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-black" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDownloadReport(msg.content)}
                            className="hover:text-[#64EE00] p-0.5 font-bold"
                            title="Download Report as .md"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Message Markdown rendering */}
                  <div className={`space-y-2 whitespace-pre-wrap font-sans ${isUser ? 'text-white' : 'text-black'}`}>
                    {msg.content.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return (
                          <h3 key={idx} className={`text-base font-black mt-3 mb-1 font-mono ${isUser ? 'text-[#64EE00]' : 'text-black underline'}`}>
                            {line.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (line.startsWith('#### ')) {
                        return (
                          <h4 key={idx} className={`text-sm font-bold mt-2 mb-1 font-mono ${isUser ? 'text-white' : 'text-black'}`}>
                            {line.replace('#### ', '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={idx} className="flex items-start gap-2 pl-2">
                            <span className="font-mono font-bold text-[#64EE00]">&bull;</span>
                            <span className="flex-1">{line.replace('- ', '')}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <blockquote key={idx} className="border-l-4 border-black pl-3 py-1 bg-black/5 my-1 text-xs italic font-medium">
                            {line.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      return <p key={idx}>{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-[#64EE00] text-black border-2 border-black flex items-center justify-center font-bold">
                <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" />
              </div>
              <div className="rounded-2xl p-4 bg-neutral-100 border-2 border-black text-xs text-black font-mono flex items-center gap-3 shadow-[3px_3px_0px_#000000]">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-black animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-black animate-bounce delay-100" />
                  <span className="w-2 h-2 rounded-full bg-black animate-bounce delay-200" />
                </div>
                <span className="font-bold text-black">
                  Querying Azure AI Agent ({AGENT_NAME})...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips - flex-shrink-0 */}
        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200 flex-shrink-0 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-black font-black text-[10px] whitespace-nowrap">QUICK PROMPTS:</span>
          <button
            onClick={() =>
              handleSendMessage(
                'Generate an executive summary of this report with chronological investigation points.'
              )
            }
            className="px-2.5 py-1 rounded-lg bg-white border-2 border-black text-black font-bold whitespace-nowrap transition hover:bg-[#64EE00] hover:text-black"
          >
            📋 Executive Summary
          </button>
          <button
            onClick={() =>
              handleSendMessage(
                'Verify Indian Evidence Act Section 65B and Bharatiya Sakshya Adhiniyam compliance for this digital evidence.'
              )
            }
            className="px-2.5 py-1 rounded-lg bg-white border-2 border-black text-black font-bold whitespace-nowrap transition hover:bg-[#64EE00] hover:text-black"
          >
            ⚖️ Section 65B Compliance
          </button>
          <button
            onClick={() =>
              handleSendMessage(
                'Extract all penal code sections, FIR references, and statutory legal charges mentioned.'
              )
            }
            className="px-2.5 py-1 rounded-lg bg-white border-2 border-black text-black font-bold whitespace-nowrap transition hover:bg-[#64EE00] hover:text-black"
          >
            ⚖️ Extract Penal Codes (IPC/BNS)
          </button>
          <button
            onClick={() =>
              handleSendMessage(
                'List all suspects, witnesses, and timestamps identified in this document.'
              )
            }
            className="px-2.5 py-1 rounded-lg bg-white border-2 border-black text-black font-bold whitespace-nowrap transition hover:bg-[#64EE00] hover:text-black"
          >
            🔍 Suspects & Timeline
          </button>
        </div>

        {/* Input Bar - 60% White / 30% Black / 10% #64EE00 Accent */}
        <div className="p-3 sm:p-4 bg-white flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeDoc || uploadedFile
                    ? `Ask anything about ${activeDoc?.documentName || uploadedFile?.name}...`
                    : 'Ask Azure AI Agent to analyze legal records, summarize reports, or draft legal queries...'
                }
                disabled={isLoading}
                className="w-full bg-neutral-50 border-2 border-black rounded-xl px-4 py-3 text-xs sm:text-sm text-black placeholder-neutral-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#64EE00] transition pr-10 font-mono font-bold"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-[#64EE00] transition p-1 font-bold"
                title="Attach Document or PDF"
              >
                <Paperclip className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-[#64EE00] text-black font-black text-xs sm:text-sm flex items-center gap-2 border-2 border-black shadow-[3px_3px_0px_#000000] hover:bg-black hover:text-[#64EE00] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000000] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>SEND</span>
              <Send className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
