import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, RefreshCw, AlertTriangle, FileText, Phone, User } from 'lucide-react';

// Dialogue States
const STATE_MENU = 'STATE_MENU';
const STATE_LODGING_NAME = 'STATE_LODGING_NAME';
const STATE_LODGING_MOBILE = 'STATE_LODGING_MOBILE';
const STATE_LODGING_PNR = 'STATE_LODGING_PNR';
const STATE_LODGING_TYPE = 'STATE_LODGING_TYPE';
const STATE_LODGING_DESC = 'STATE_LODGING_DESC';
const STATE_LODGING_SUBMITTING = 'STATE_LODGING_SUBMITTING';
const STATE_TRACKING_ID = 'STATE_TRACKING_ID';
const STATE_TRACKING_SUBMITTING = 'STATE_TRACKING_SUBMITTING';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [chatState, setChatState] = useState(STATE_MENU);
    const [complaintData, setComplaintData] = useState({});
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef(null);

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: 1,
                    text: "Namaste! I am RailMitra, your Rail Madad Chat Assistant. 🚄\n\nI can assist you in filing complaints, tracking their status, or answering questions. How can I help you today?",
                    sender: 'bot',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    options: ["Lodge a Complaint 📝", "Track Complaint 🔍", "General FAQs ℹ️"]
                }
            ]);
        }
    }, [messages]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const resetChat = () => {
        setChatState(STATE_MENU);
        setComplaintData({});
        setMessages([
            {
                id: Date.now(),
                text: "Menu reset. How can I assist you now?",
                sender: 'bot',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                options: ["Lodge a Complaint 📝", "Track Complaint 🔍", "General FAQs ℹ️"]
            }
        ]);
    };

    const addMessage = (text, sender, options = null, statusCard = null) => {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now() + Math.random(),
                text,
                sender,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                options,
                statusCard
            }
        ]);
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const text = inputText.trim();
        if (!text) return;

        setInputText('');
        addMessage(text, 'user');

        // Process message based on the active dialogue state
        processUserMessage(text);
    };

    const handleOptionClick = (option) => {
        // Log selection
        addMessage(option, 'user');
        processUserMessage(option);
    };

    const simulateTyping = (callback, delay = 750) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            callback();
        }, delay);
    };

    const processUserMessage = async (text) => {
        const query = text.toLowerCase().trim();

        // Check if user wants to force reset or go back to main menu
        if (query === 'back to menu 🏠' || query === 'back to main menu 🏠' || query === 'menu') {
            simulateTyping(() => {
                setChatState(STATE_MENU);
                setComplaintData({});
                addMessage(
                    "Here is the main menu. How can I help you?",
                    'bot',
                    ["Lodge a Complaint 📝", "Track Complaint 🔍", "General FAQs ℹ️"]
                );
            });
            return;
        }

        // --- MENU STATE ---
        if (chatState === STATE_MENU) {
            if (query.includes('lodge a complaint') || query.includes('lodge complaint') || query.includes('lodge another complaint') || query.includes('file a complaint') || query.includes('register complaint') || query.includes('grievance')) {
                simulateTyping(() => {
                    setChatState(STATE_LODGING_NAME);
                    addMessage("Let's lodge a complaint step-by-step. First, please enter your Full Name:", 'bot');
                });
            } else if (query.includes('track complaint') || query.includes('track status') || query.includes('track another complaint') || query.includes('status')) {
                simulateTyping(() => {
                    setChatState(STATE_TRACKING_ID);
                    addMessage("Please enter your 9-character Complaint Reference ID (e.g. REF123456):", 'bot', ["Back to Menu 🏠"]);
                });
            } else if (query.includes('general faqs') || query.includes('faq') || query.includes('help')) {
                simulateTyping(() => {
                    addMessage(
                        "You can ask me about refunds, food services, cleanliness, or security. Or choose one of the options below:",
                        'bot',
                        ["Medical emergency 🚨", "Refund / TDR 💰", "Cleanliness issue 🧹", "Food catering 🍔", "Back to Menu 🏠"]
                    );
                });
            } else if (query.includes('medical emergency 🚨') || query.includes('medical') || query.includes('doctor')) {
                simulateTyping(() => {
                    addMessage(
                        "For medical emergencies on-board or at stations, please call 139 immediately to alert the train crew. You can also lodge a complaint under the 'Medical Emergency' category so that the next station's medical team can assist you upon arrival.",
                        'bot',
                        ["Lodge a Complaint 📝", "Call Help 139 📞", "Back to Menu 🏠"]
                    );
                });
            } else if (query.includes('refund / tdr 💰') || query.includes('refund') || query.includes('cancel')) {
                simulateTyping(() => {
                    addMessage(
                        "To claim a refund for cancelled tickets or train delays of more than 3 hours, you must file a TDR (Ticket Deposit Receipt) online via IRCTC. For counter tickets, refund is available at reservation counters.",
                        'bot',
                        ["Track Status 🔍", "Back to Menu 🏠"]
                    );
                });
            } else if (query.includes('cleanliness issue 🧹') || query.includes('clean') || query.includes('toilet') || query.includes('washroom')) {
                simulateTyping(() => {
                    addMessage(
                        "For cleanliness issues in the coach, toilets or request for clean linen, log a complaint under the 'Cleanliness' category. The coach housekeeping staff will be notified to clean it at the next junction.",
                        'bot',
                        ["Lodge a Complaint 📝", "Back to Menu 🏠"]
                    );
                });
            } else if (query.includes('food catering 🍔') || query.includes('food') || query.includes('catering') || query.includes('meal')) {
                simulateTyping(() => {
                    addMessage(
                        "Order meals directly to your train seat using IRCTC's e-Catering services via the app, website (ecatering.irctc.co.in), or by calling 1323. For food quality issues, log a complaint under 'Catering'.",
                        'bot',
                        ["Lodge a Complaint 📝", "Back to Menu 🏠"]
                    );
                });
            } else if (query.includes('call help 139 📞')) {
                simulateTyping(() => {
                    addMessage("You can dial the National Railway Helpline: **139** directly on your phone for immediate help, security, medical, PNR or catering query.", 'bot', ["Back to Menu 🏠"]);
                });
            } else {
                // Call backend API /api/chat for FAQ search
                setIsTyping(true);
                try {
                    const response = await axios.post('/api/chat', { message: text });
                    setIsTyping(false);
                    addMessage(response.data.reply, 'bot', response.data.options);
                } catch (error) {
                    setIsTyping(false);
                    addMessage(
                        "I'm sorry, I am experiencing server difficulties. How can I help you otherwise?",
                        'bot',
                        ["Lodge a Complaint 📝", "Track Complaint 🔍", "Back to Menu 🏠"]
                    );
                }
            }
        }

        // --- LODGING A COMPLAINT WORKFLOW ---
        else if (chatState === STATE_LODGING_NAME) {
            if (text.length < 3) {
                simulateTyping(() => {
                    addMessage("Please enter a valid full name (minimum 3 characters):", 'bot');
                });
                return;
            }
            setComplaintData(prev => ({ ...prev, name: text }));
            simulateTyping(() => {
                setChatState(STATE_LODGING_MOBILE);
                addMessage(`Nice to meet you, ${text}! Now, please enter your 10-digit mobile number:`, 'bot');
            });
        }

        else if (chatState === STATE_LODGING_MOBILE) {
            const isPhoneValid = /^\d{10}$/.test(text);
            if (!isPhoneValid) {
                simulateTyping(() => {
                    addMessage("Invalid phone number. Please enter exactly 10 digits (e.g. 9876543210):", 'bot');
                });
                return;
            }
            setComplaintData(prev => ({ ...prev, mobile: text }));
            simulateTyping(() => {
                setChatState(STATE_LODGING_PNR);
                addMessage("Got it. Please enter your PNR Number (if any). If you don't have a PNR, click 'Skip PNR' below:", 'bot', ["Skip PNR ➔"]);
            });
        }

        else if (chatState === STATE_LODGING_PNR) {
            const isSkip = query.includes('skip');
            const pnrValue = isSkip ? 'N/A' : text;
            setComplaintData(prev => ({ ...prev, pnr: pnrValue }));

            simulateTyping(() => {
                setChatState(STATE_LODGING_TYPE);
                addMessage("Select the category of your complaint from the options below:", 'bot', [
                    "Cleanliness 🧹", "Catering 🍔", "Electrical ⚡", "Medical Emergency 🚨", "Security 🛡️", "Other 📝"
                ]);
            });
        }

        else if (chatState === STATE_LODGING_TYPE) {
            // Strip emoji from choice
            const choice = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();
            setComplaintData(prev => ({ ...prev, type: choice }));

            simulateTyping(() => {
                setChatState(STATE_LODGING_DESC);
                addMessage(`Understood. Please describe the ${choice} issue in detail. Mention coach, seat, train, or station if relevant:`, 'bot');
            });
        }

        else if (chatState === STATE_LODGING_DESC) {
            if (text.length < 10) {
                simulateTyping(() => {
                    addMessage("Please describe the issue in at least 10 characters so we can take action:", 'bot');
                });
                return;
            }

            const updatedData = { ...complaintData, description: text };
            setComplaintData(updatedData);
            setChatState(STATE_LODGING_SUBMITTING);
            setIsTyping(true);

            try {
                const response = await axios.post('/api/complaints', updatedData);
                simulateTyping(() => {
                    setChatState(STATE_MENU);
                    setComplaintData({});
                    addMessage(
                        `Success! Your complaint has been successfully registered. 🎉\n\nReference ID: **${response.data.id}**\nOur teams have been notified. You can track this complaint status anytime.`,
                        'bot',
                        ["Track Complaint Status 🔍", "Back to Menu 🏠"],
                        {
                            id: response.data.id,
                            name: updatedData.name,
                            type: updatedData.type,
                            pnr: updatedData.pnr,
                            status: 'Pending'
                        }
                    );
                });
            } catch (error) {
                simulateTyping(() => {
                    setChatState(STATE_MENU);
                    setComplaintData({});
                    addMessage(
                        "Sorry, there was a server error registering your complaint. Please try filing manually on the homepage or dial 139.",
                        'bot',
                        ["Lodge a Complaint 📝", "Back to Menu 🏠"]
                    );
                });
            }
        }

        // --- TRACKING COMPLAINT WORKFLOW ---
        else if (chatState === STATE_TRACKING_ID) {
            if (query.includes('track complaint status') || query.includes('track status') || query.includes('status')) {
                simulateTyping(() => {
                    addMessage("Please enter the Complaint Reference ID (e.g. REF123456):", 'bot', ["Back to Menu 🏠"]);
                });
                return;
            }

            // Strip prefix/suffix spaces and validate ref id
            const refId = text.toUpperCase().trim();
            setChatState(STATE_TRACKING_SUBMITTING);
            setIsTyping(true);

            try {
                const response = await axios.get(`/api/complaints/${refId}`);
                simulateTyping(() => {
                    setChatState(STATE_MENU);
                    addMessage(
                        `I found your complaint details! Here is the latest status for Reference ID: **${refId}**`,
                        'bot',
                        ["Lodge a Complaint 📝", "Track another Complaint 🔍", "Back to Menu 🏠"],
                        {
                            id: response.data.id,
                            name: response.data.name,
                            type: response.data.type,
                            pnr: response.data.pnr,
                            status: response.data.status,
                            assignedRole: response.data.assignedRole,
                            resolution: response.data.resolution
                        }
                    );
                });
            } catch (error) {
                simulateTyping(() => {
                    setChatState(STATE_MENU);
                    addMessage(
                        `Sorry, I couldn't find any complaint matching ID: **${refId}**. Please double-check the ID or try again.`,
                        'bot',
                        ["Track Complaint 🔍", "Back to Menu 🏠"]
                    );
                });
            }
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <div className="chatbot-fab" onClick={toggleChat} title="RailMitra Help Desk">
                <div className="chatbot-fab-pulse"></div>
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </div>

            {/* Chat Panel */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <span style={{ fontSize: '1.2rem' }}>🤖</span>
                            </div>
                            <div className="chatbot-title-container">
                                <span className="chatbot-title">RailMitra</span>
                                <span className="chatbot-subtitle">
                                    <span className="chatbot-status-dot"></span>
                                    Railway Assistant
                                </span>
                            </div>
                        </div>
                        <div className="chatbot-header-actions">
                            <button className="chatbot-header-btn" onClick={resetChat} title="Reset Conversation">
                                <RefreshCw size={16} />
                            </button>
                            <button className="chatbot-header-btn" onClick={toggleChat} title="Close Panel">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="chatbot-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
                                <div className="chat-bubble">
                                    <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                                    {/* Status Card Embed */}
                                    {msg.statusCard && (
                                        <div className="chat-status-card">
                                            <div className="chat-status-item" style={{ marginTop: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                                                <span className="chat-status-label">Reference ID:</span>
                                                <span className="chat-status-value" style={{ color: '#8B0000' }}>{msg.statusCard.id}</span>
                                            </div>
                                            <div className="chat-status-item">
                                                <span className="chat-status-label">Category:</span>
                                                <span className="chat-status-value">{msg.statusCard.type}</span>
                                            </div>
                                            <div className="chat-status-item">
                                                <span className="chat-status-label">PNR Number:</span>
                                                <span className="chat-status-value">{msg.statusCard.pnr}</span>
                                            </div>
                                            <div className="chat-status-item">
                                                <span className="chat-status-label">Status:</span>
                                                <span className={`status-badge ${msg.statusCard.status === 'Resolved' ? 'status-resolved' : 'status-pending'}`}>
                                                    {msg.statusCard.status}
                                                </span>
                                            </div>
                                            {msg.statusCard.assignedRole && (
                                                <div className="chat-status-item">
                                                    <span className="chat-status-label">Assigned To:</span>
                                                    <span className="chat-status-value">{msg.statusCard.assignedRole}</span>
                                                </div>
                                            )}
                                            {msg.statusCard.resolution && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid #f0f0f0', paddingTop: '4px', marginTop: '4px' }}>
                                                    <span className="chat-status-label" style={{ fontSize: '0.75rem' }}>Resolution Action:</span>
                                                    <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#155724' }}>"{msg.statusCard.resolution}"</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Options Tag buttons */}
                                    {msg.options && msg.options.length > 0 && (
                                        <div className="chatbot-options">
                                            {msg.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    className="chatbot-option-btn"
                                                    onClick={() => handleOptionClick(opt)}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="chat-time">{msg.time}</div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="chat-message-row bot">
                                <div className="chat-bubble">
                                    <div className="typing-indicator">
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Bar */}
                    <form className="chatbot-input-container" onSubmit={handleSend}>
                        <input
                            type="text"
                            className="chatbot-input"
                            placeholder="Type a message or click options..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={
                                chatState === STATE_LODGING_SUBMITTING ||
                                chatState === STATE_LODGING_TYPE ||
                                chatState === STATE_TRACKING_SUBMITTING
                            }
                        />
                        <button
                            type="submit"
                            className="chatbot-send-btn"
                            disabled={!inputText.trim() || isTyping}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;
