import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Send, Star, ArrowRight, Clock, Award, ChevronRight, Loader2, MessageSquare, History } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import VoiceInput from '../components/VoiceInput';
import InterviewAnswerInput from '../components/InterviewAnswerInput';
import toast from 'react-hot-toast';

const MockInterviewPage = () => {
  const { isDark } = useTheme();
  const [phase, setPhase] = useState('setup'); // setup | interview | results | history
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [summary, setSummary] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [questions, feedback]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/mock-interview');
      setSessions(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSessions(); }, []);

  const startInterview = async () => {
    if (!role) return toast.error('Please enter a target role');
    setLoading(true);
    try {
      const res = await api.post('/mock-interview/start', { role, company });
      setSessionId(res.data.sessionId);
      setCurrentQuestion(res.data.question);
      setTotalQuestions(res.data.totalQuestions || 5);
      setQuestions([{ ...res.data.question, type: 'question' }]);
      setPhase('interview');
      setAnsweredCount(0);
      setFeedback(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error starting interview');
    } finally { setLoading(false); }
  };

  const submitAnswer = async (answerText) => {
    const textToSubmit = answerText || answer;
    if (!textToSubmit || !textToSubmit.trim()) return toast.error('Please provide an answer');
    setLoading(true);
    setFeedback(null);

    // Add answer to chat
    setQuestions(prev => [...prev, { type: 'answer', text: textToSubmit.trim() }]);

    try {
      const res = await api.post(`/mock-interview/${sessionId}/answer`, { answer: textToSubmit.trim() });
      setAnsweredCount(res.data.answeredCount);

      // Show per-answer feedback
      const fb = res.data.feedback;
      setFeedback(fb);
      setQuestions(prev => [...prev, { type: 'feedback', ...fb }]);

      if (res.data.isComplete) {
        // Auto-end session
        setTimeout(() => endInterview(), 1500);
      } else if (res.data.nextQuestion) {
        // Show next question after a brief pause
        setTimeout(() => {
          setCurrentQuestion(res.data.nextQuestion);
          setQuestions(prev => [...prev, { ...res.data.nextQuestion, type: 'question' }]);
          setFeedback(null);
        }, 2000);
      }

      setAnswer('');
    } catch (err) {
      toast.error('Error submitting answer');
    } finally { setLoading(false); }
  };

  const endInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/mock-interview/${sessionId}/end`);
      setSummary(res.data.summary);
      setPhase('results');
      fetchSessions();
    } catch (err) {
      toast.error('Error generating summary');
    } finally { setLoading(false); }
  };

  const viewSession = async (id) => {
    try {
      const res = await api.get(`/mock-interview/${id}`);
      setSelectedSession(res.data);
    } catch (err) { toast.error('Error loading session'); }
  };

  const handleVoiceTranscript = (text, isFinal) => {
    setAnswer(text);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-theme-text-muted'}`} />
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-theme-text flex items-center">
            <Mic className="w-6 h-6 text-primary mr-3" />
            AI Mock Interview
          </h1>
          <p className="text-sm text-theme-text-muted mt-1">Practice with AI-powered interviews and get instant feedback</p>
        </div>
        <div className="flex space-x-2">
          {phase !== 'setup' && (
            <button onClick={() => { setPhase('setup'); setQuestions([]); setFeedback(null); setSummary(null); setSelectedSession(null); }}
              className="px-4 py-2 text-xs font-semibold text-theme-text-secondary bg-surface-hover rounded-xl hover:bg-primary/10 transition-colors">
              New Interview
            </button>
          )}
          <button onClick={() => { setPhase('history'); fetchSessions(); setSelectedSession(null); }}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-theme-text-secondary bg-surface-hover rounded-xl hover:bg-primary/10 transition-colors">
            <History className="w-3.5 h-3.5" /><span>History</span>
          </button>
        </div>
      </div>

      {/* SETUP PHASE */}
      {phase === 'setup' && (
        <div className="max-w-lg mx-auto">
          <div className="bg-surface rounded-3xl border border-theme-border p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-theme-text">Start Mock Interview</h2>
              <p className="text-sm text-theme-text-muted mt-2">AI will ask you 5 questions and rate each answer</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Target Role *</label>
                <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer, Full Stack Developer"
                  className="w-full px-4 py-3 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Company (optional)</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Amazon, Infosys"
                  className="w-full px-4 py-3 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </div>
              <button onClick={startInterview} disabled={loading}
                className="w-full py-3 bg-gradient-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mic className="w-4 h-4" /><span>Start Interview</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW PHASE */}
      {phase === 'interview' && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Progress Bar */}
          <div className="bg-surface rounded-2xl border border-theme-border p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-theme-text-secondary mb-2">
              <span>Question {Math.min(answeredCount + 1, totalQuestions)} of {totalQuestions}</span>
              <span className="text-primary">{Math.round((answeredCount / totalQuestions) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-theme-border rounded-full h-2">
              <div className="bg-gradient-primary h-2 rounded-full transition-all duration-500" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}></div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="bg-surface rounded-3xl border border-theme-border shadow-sm overflow-hidden">
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {questions.map((item, i) => (
                <div key={i}>
                  {item.type === 'question' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-primary-50 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
                        <p className="text-[10px] font-bold text-primary uppercase mb-1">
                          Q{item.questionNumber} · {item.questionType} · {item.difficulty}
                        </p>
                        <p className="text-sm text-theme-text leading-relaxed">{item.questionText}</p>
                      </div>
                    </div>
                  )}
                  {item.type === 'answer' && (
                    <div className="flex justify-end">
                      <div className="bg-surface-hover rounded-2xl rounded-tr-sm p-4 max-w-[85%]">
                        <p className="text-sm text-theme-text leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  )}
                  {item.type === 'feedback' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl rounded-tl-sm p-4 max-w-[85%] border border-amber-200/50 dark:border-amber-800/30">
                        <div className="flex items-center space-x-1 mb-2">{renderStars(item.rating)}</div>
                        <p className="text-sm text-theme-text leading-relaxed">{item.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center space-x-2 text-theme-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">AI is thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-theme-border p-4">
              <InterviewAnswerInput onSubmit={submitAnswer} loading={loading} />
              {answeredCount > 0 && answeredCount < totalQuestions && (
                <button onClick={endInterview} disabled={loading}
                  className="mt-3 text-xs text-theme-text-muted hover:text-primary font-semibold transition-colors">
                  End Interview Early →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESULTS PHASE */}
      {phase === 'results' && summary && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-surface rounded-3xl border border-theme-border p-8 shadow-sm text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-theme-text">{summary.overallScore}/100</h2>
            <p className={`text-sm font-bold mt-1 ${
              summary.readinessLevel === 'Interview Ready' ? 'text-emerald-500' :
              summary.readinessLevel === 'Almost Ready' ? 'text-amber-500' : 'text-rose-500'
            }`}>{summary.readinessLevel || 'Assessment Complete'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface rounded-2xl border border-theme-border p-5">
              <h3 className="font-bold text-emerald-600 text-sm mb-3">💪 Strengths</h3>
              <ul className="space-y-2">
                {(summary.strengths || []).map((s, i) => (
                  <li key={i} className="text-xs text-theme-text-secondary flex items-start space-x-2">
                    <span className="text-emerald-500 mt-0.5">✓</span><span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface rounded-2xl border border-theme-border p-5">
              <h3 className="font-bold text-rose-600 text-sm mb-3">🎯 Areas to Improve</h3>
              <ul className="space-y-2">
                {(summary.weaknesses || []).map((w, i) => (
                  <li key={i} className="text-xs text-theme-text-secondary flex items-start space-x-2">
                    <span className="text-rose-500 mt-0.5">→</span><span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-theme-border p-5">
            <h3 className="font-bold text-primary text-sm mb-3">📋 Suggestions</h3>
            <ul className="space-y-2">
              {(summary.suggestions || []).map((s, i) => (
                <li key={i} className="text-xs text-theme-text-secondary flex items-start space-x-2">
                  <span className="text-primary mt-0.5">{i + 1}.</span><span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {summary.focusAreas && summary.focusAreas.length > 0 && (
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-semibold text-theme-text-muted">Focus Areas:</span>
              {summary.focusAreas.map(area => (
                <span key={area} className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary-50 text-primary">{area}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HISTORY PHASE */}
      {phase === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="font-bold text-theme-text text-base">Past Sessions</h3>
            {sessions.length === 0 ? (
              <p className="text-xs text-theme-text-muted py-8 text-center bg-surface rounded-2xl border border-theme-border">No past sessions yet.</p>
            ) : (
              sessions.map(s => (
                <div key={s._id} onClick={() => viewSession(s._id)}
                  className={`bg-surface rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedSession?._id === s._id ? 'border-primary shadow-md' : 'border-theme-border'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-theme-text">{s.role}</p>
                      <p className="text-[11px] text-theme-text-muted">{s.company || 'General'} · {new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      {s.overallSummary?.overallScore != null && (
                        <p className="text-lg font-black text-primary">{s.overallSummary.overallScore}</p>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>{s.status}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="bg-surface rounded-3xl border border-theme-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-theme-text">{selectedSession.role}</h3>
                    <p className="text-xs text-theme-text-muted">{selectedSession.company || 'General'} · {new Date(selectedSession.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedSession.overallSummary?.overallScore != null && (
                    <div className="text-2xl font-black text-primary">{selectedSession.overallSummary.overallScore}/100</div>
                  )}
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {selectedSession.questions.map((q, i) => (
                    <div key={i} className="p-4 bg-surface-hover rounded-2xl">
                      <p className="text-[10px] font-bold text-primary uppercase mb-1">Q{q.questionNumber} · {q.questionType}</p>
                      <p className="text-sm font-semibold text-theme-text mb-2">{q.questionText}</p>
                      {q.answerText && <p className="text-xs text-theme-text-secondary mb-2 pl-3 border-l-2 border-theme-border">{q.answerText}</p>}
                      {q.rating && (
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStars(q.rating)}</div>
                          <span className="text-[11px] text-theme-text-muted">{q.feedback}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedSession.overallSummary?.strengths?.length > 0 && (
                  <div className="border-t border-theme-border pt-4">
                    <h4 className="font-bold text-sm text-theme-text mb-2">Summary</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-emerald-600 mb-1">Strengths</p>
                        {selectedSession.overallSummary.strengths.map((s, i) => <p key={i} className="text-theme-text-secondary">• {s}</p>)}
                      </div>
                      <div>
                        <p className="font-semibold text-rose-600 mb-1">Weaknesses</p>
                        {selectedSession.overallSummary.weaknesses.map((w, i) => <p key={i} className="text-theme-text-secondary">• {w}</p>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface rounded-3xl border border-theme-border p-12 text-center">
                <History className="w-10 h-10 text-theme-text-muted mx-auto mb-3" />
                <p className="text-sm text-theme-text-muted">Select a session to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewPage;
