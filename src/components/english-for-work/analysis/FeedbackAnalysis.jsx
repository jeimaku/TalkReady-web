import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';

const FeedbackAnalysis = () => {
    const { sessionId } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!sessionId) return;
            const q = query(collection(db, "customer_service_analysis"), where("sessionId", "==", sessionId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setAnalysis(querySnapshot.docs[0].data().analysis);
            } else {
                console.log("❌ No feedback found for this session.");
            }
        };

        fetchAnalysis();
    }, [sessionId]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4">
                <h1 className="text-3xl font-bold text-center mb-4">Feedback Analysis</h1>
                {analysis ? (
                    <div className="text-gray-700 text-lg p-4 border rounded-lg">
                        <p><strong>Grammar Accuracy:</strong> {analysis.grammar} %</p>
                        <p><strong>Vocabulary Complexity:</strong> {analysis.vocabulary} %</p>
                        <p><strong>Sentence Structure:</strong> {analysis.structure} %</p>
                        <p>{analysis.details}</p>
                    </div>
                ) : (
                    <p className="text-gray-500">Loading analysis...</p>
                )}
                <button
                    onClick={() => navigate("/english-for-work")}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                >
                    Back to Simulation
                </button>
            </div>
        </div>
    );
};

export default FeedbackAnalysis;
