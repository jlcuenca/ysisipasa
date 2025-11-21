import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import './QuestionnaireFlow.css';

function QuestionnaireFlow() {
    const { category: urlCategory } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(urlCategory || null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [questionnaire, setQuestionnaire] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadQuestionnaires();
    }, []);

    useEffect(() => {
        if (selectedCategory && categories.length > 0) {
            const cat = categories.find(c => c.id === selectedCategory);
            setQuestionnaire(cat);
            setCurrentQuestion(0);
            setResponses({});
        }
    }, [selectedCategory, categories]);

    const loadQuestionnaires = async () => {
        try {
            const response = await api.get('/questionnaires');
            setCategories(response.data.categories);
            setLoading(false);
        } catch (error) {
            console.error('Error loading questionnaires:', error);
            setLoading(false);
        }
    };

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        navigate(`/questionnaire/${categoryId}`);
    };

    const handleAnswer = (questionId, option) => {
        setResponses({
            ...responses,
            [questionId]: {
                questionId,
                answerValue: option.value,
                riskWeight: option.riskWeight,
            },
        });
    };

    const handleNext = () => {
        if (currentQuestion < questionnaire.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            await api.post('/questionnaires/submit', {
                category: selectedCategory,
                responses: Object.values(responses),
            });

            // Ir a resultados
            navigate('/results');
        } catch (error) {
            console.error('Error submitting questionnaire:', error);
            alert('Error al enviar el cuestionario');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="questionnaire-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    // Category Selection
    if (!selectedCategory) {
        return (
            <div className="questionnaire-screen">
                <div className="container">
                    <motion.div
                        className="category-selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1>Elige una categoría para evaluar</h1>
                        <p className="subtitle">¿Qué aspecto de tu vida quieres revisar hoy?</p>

                        <div className="categories-grid">
                            {categories.map((cat, index) => (
                                <motion.div
                                    key={cat.id}
                                    className="category-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleCategorySelect(cat.id)}
                                >
                                    <div className="category-icon">{cat.icon}</div>
                                    <h3>{cat.name}</h3>
                                    <p>{cat.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Questionnaire
    if (!questionnaire) return null;

    const question = questionnaire.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questionnaire.questions.length) * 100;
    const isLastQuestion = currentQuestion === questionnaire.questions.length - 1;
    const currentResponse = responses[question.id];

    return (
        <div className="questionnaire-screen">
            <div className="container">
                <div className="questionnaire-content">
                    {/* Progress Bar */}
                    <div className="progress-section">
                        <div className="progress-info">
                            <span>{questionnaire.name}</span>
                            <span className="text-muted">
                                {currentQuestion + 1} de {questionnaire.questions.length}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <motion.div
                                className="progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Question */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={question.id}
                            className="question-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="question-text">{question.text}</h2>

                            <div className="options-list">
                                {question.options.map((option, index) => (
                                    <motion.button
                                        key={option.value}
                                        className={`option-button ${currentResponse?.answerValue === option.value ? 'selected' : ''
                                            }`}
                                        onClick={() => handleAnswer(question.id, option)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {option.label}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="question-navigation">
                        <button
                            className="btn btn-secondary"
                            onClick={handleBack}
                            disabled={currentQuestion === 0}
                        >
                            ← Anterior
                        </button>

                        {!isLastQuestion ? (
                            <button
                                className="btn btn-primary"
                                onClick={handleNext}
                                disabled={!currentResponse}
                            >
                                Siguiente →
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={!currentResponse || submitting}
                            >
                                {submitting ? 'Enviando...' : '¡Terminar! 🎉'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestionnaireFlow;
