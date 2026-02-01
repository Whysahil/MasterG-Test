import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { TestAttempt } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, Target, Clock, ArrowRight, Download } from 'lucide-react';
import { jsPDF } from "jspdf";

const ResultScreen: React.FC = () => {
  const location = useLocation();
  const result = location.state?.result as TestAttempt;

  if (!result) return <Navigate to="/dashboard" />;

  const analyticsData = [
    { name: 'Your Score', value: result.score, color: '#4F46E5' },
    { name: 'Topper', value: result.score + 20, color: '#10B981' }, // Simulated comparison
    { name: 'Average', value: result.score - 10, color: '#6B7280' },
  ];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header Background
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(0, 0, 210, 40, 'F');
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("MasterG Scorecard", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Government Exam Preparation Platform", 105, 30, { align: "center" });

    // Test Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 55);
    doc.text(`Test Reference ID: ${result.testId}`, 20, 55);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 60, 190, 60);

    // Score Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Summary", 20, 75);

    // Stats Grid Simulation
    // Score
    doc.setFillColor(243, 244, 246); // gray-100
    doc.roundedRect(20, 85, 50, 40, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("TOTAL SCORE", 30, 95);
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // indigo
    doc.text(`${result.score}`, 30, 115);

    // Accuracy
    doc.setFillColor(236, 253, 245); // green-50
    doc.roundedRect(80, 85, 50, 40, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("ACCURACY", 90, 95);
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // green
    doc.text(`${result.accuracy.toFixed(1)}%`, 90, 115);

    // Status
    doc.setFillColor(245, 243, 255); // purple-50
    doc.roundedRect(140, 85, 50, 40, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("STATUS", 150, 95);
    doc.setFontSize(14); // Smaller font for text status
    doc.setTextColor(124, 58, 237); // purple
    doc.text(`${result.status}`, 150, 115);

    // Detailed Analytics Text
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Detailed Analysis", 20, 145);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const startTime = new Date(result.startTime).toLocaleTimeString();
    const endTime = new Date(result.endTime).toLocaleTimeString();
    
    doc.text(`• Start Time: ${startTime}`, 25, 160);
    doc.text(`• End Time: ${endTime}`, 25, 170);
    doc.text(`• Performance Grade: ${result.score > 15 ? 'Excellent' : result.score > 5 ? 'Average' : 'Needs Improvement'}`, 25, 180);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("© 2024 MasterG Inc. All Rights Reserved.", 105, 280, { align: "center" });

    doc.save(`Scorecard_${result.testId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-center p-10 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="inline-flex items-center justify-center p-4 bg-yellow-100 rounded-full text-yellow-600 mb-6">
            <Award size={48} />
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Test Submitted Successfully!</h1>
          <p className="text-gray-500 text-lg">Detailed analysis of your performance has been generated.</p>
          
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <div className="text-indigo-600 text-sm font-bold uppercase tracking-wide mb-1">Total Score</div>
              <div className="text-4xl font-black text-gray-900">{result.score}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <div className="text-green-600 text-sm font-bold uppercase tracking-wide mb-1">Accuracy</div>
              <div className="text-4xl font-black text-gray-900">{result.accuracy.toFixed(1)}%</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
              <div className="text-purple-600 text-sm font-bold uppercase tracking-wide mb-1">Status</div>
              <div className="text-4xl font-black text-gray-900">{result.status}</div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Target size={20} className="text-red-500" /> Comparative Analysis
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {analyticsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">Comparison with Top Scorer and Class Average</p>
          </div>

          {/* Detailed Stats */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-500" /> Time Analytics
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Start Time</span>
                  <span className="font-mono">{new Date(result.startTime).toLocaleTimeString()}</span>
                </li>
                <li className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">End Time</span>
                  <span className="font-mono">{new Date(result.endTime).toLocaleTimeString()}</span>
                </li>
                <li className="flex justify-between pt-2">
                  <span className="text-gray-900 font-medium">Performance Grade</span>
                  <span className={`font-bold ${result.score > 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {result.score > 15 ? 'Excellent' : result.score > 5 ? 'Average' : 'Needs Improvement'}
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="mt-8 space-y-3">
              <button 
                onClick={handleDownloadPDF}
                className="w-full flex justify-center items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-3 rounded-lg font-medium transition-colors"
              >
                <Download size={18} /> Download Scorecard
              </button>
              <Link to="/dashboard" className="w-full block text-center bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2">
                Back to Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;