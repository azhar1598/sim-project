"use client";

import { useState } from "react";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";

export default function Support() {
  const [activeTab, setActiveTab] = useState("help");
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    description: "",
  });

  const tabs = [
    { id: "help", label: "Help Center", icon: "❓" },
    { id: "contact", label: "Contact Support", icon: "📞" },
    { id: "tickets", label: "My Tickets", icon: "🎫" },
    { id: "docs", label: "Documentation", icon: "📚" },
  ];

  const faqItems = [
    {
      question: "How do I create a new block entry?",
      answer:
        "Navigate to the Block Entry section from the sidebar, fill in the dimensions, and click 'Create Block & Generate QR Code'. The system will automatically calculate estimated slabs and generate a unique QR code.",
    },
    {
      question: "Why is my QR code scanner not working?",
      answer:
        "Make sure your browser has camera permissions enabled. You can also try uploading an image of the QR code or manually entering the QR data if camera scanning isn't working.",
    },
    {
      question: "How do I track slab yield accuracy?",
      answer:
        "Use the Slab Inspection feature to record actual dimensions and quality. The system automatically compares actual vs estimated yield and updates block statistics.",
    },
    {
      question: "Can I export my inventory data?",
      answer:
        "Yes! Go to the Inventory section and use the 'Export Data' button to download your blocks and slabs data in CSV format.",
    },
    {
      question: "How do I change my account settings?",
      answer:
        "Click on your profile in the top-right corner, then select 'Settings' from the dropdown menu to access account preferences.",
    },
  ];

  const handleTicketFormChange = (field: string, value: string) => {
    setTicketForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle ticket submission
    console.log("Submitting ticket:", ticketForm);
    alert(
      "Support ticket submitted successfully! We'll get back to you within 24 hours."
    );
    setTicketForm({
      subject: "",
      category: "general",
      priority: "medium",
      description: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">
          Get help with your StoneFactory account and features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Support Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <nav className="space-y-1 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Contact */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <span>📧</span>
                <span className="text-gray-600">support@stonefactory.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span className="text-gray-600">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⏰</span>
                <span className="text-gray-600">Mon-Fri 9AM-6PM EST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Help Center Tab */}
            {activeTab === "help" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>

                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg"
                    >
                      <details className="group">
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-lg">
                          <h3 className="font-medium text-gray-900">
                            {item.question}
                          </h3>
                          <svg
                            className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </summary>
                        <div className="px-4 pb-4">
                          <p className="text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Still need help?
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Can't find what you're looking for? Our support team is here
                    to help!
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setActiveTab("contact")}
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            )}

            {/* Contact Support Tab */}
            {activeTab === "contact" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Contact Support
                </h2>

                <form onSubmit={handleTicketSubmit} className="space-y-6">
                  <Input
                    label="Subject"
                    value={ticketForm.subject}
                    onChange={(e) =>
                      handleTicketFormChange("subject", e.target.value)
                    }
                    placeholder="Brief description of your issue"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={ticketForm.category}
                        onChange={(e) =>
                          handleTicketFormChange("category", e.target.value)
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="general">General Question</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing & Account</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={ticketForm.priority}
                        onChange={(e) =>
                          handleTicketFormChange("priority", e.target.value)
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <Textarea
                    label="Description"
                    value={ticketForm.description}
                    onChange={(e) =>
                      handleTicketFormChange("description", e.target.value)
                    }
                    rows={6}
                    placeholder="Please provide detailed information about your issue..."
                    required
                  />

                  <Button type="submit" variant="primary">
                    Submit Ticket
                  </Button>
                </form>
              </div>
            )}

            {/* My Tickets Tab */}
            {activeTab === "tickets" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  My Support Tickets
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      id: "#12345",
                      subject: "QR Scanner not working",
                      status: "Open",
                      priority: "High",
                      date: "Dec 15, 2024",
                    },
                    {
                      id: "#12344",
                      subject: "Export functionality question",
                      status: "Resolved",
                      priority: "Medium",
                      date: "Dec 10, 2024",
                    },
                    {
                      id: "#12343",
                      subject: "Account settings help",
                      status: "Closed",
                      priority: "Low",
                      date: "Dec 5, 2024",
                    },
                  ].map((ticket, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">
                              {ticket.id}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                ticket.status === "Open"
                                  ? "bg-green-100 text-green-800"
                                  : ticket.status === "Resolved"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {ticket.status}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                ticket.priority === "High"
                                  ? "bg-red-100 text-red-800"
                                  : ticket.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{ticket.subject}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {ticket.date}
                          </p>
                        </div>
                        <Button variant="secondary" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documentation Tab */}
            {activeTab === "docs" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Documentation
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Getting Started Guide",
                      description: "Learn the basics of using StoneFactory",
                      icon: "🚀",
                      link: "#",
                    },
                    {
                      title: "Block Management",
                      description: "How to create and manage stone blocks",
                      icon: "🧱",
                      link: "#",
                    },
                    {
                      title: "QR Code Scanning",
                      description: "Complete guide to QR code functionality",
                      icon: "📱",
                      link: "#",
                    },
                    {
                      title: "Slab Inspection",
                      description: "Track and inspect slab quality",
                      icon: "🔍",
                      link: "#",
                    },
                    {
                      title: "Inventory Management",
                      description: "Organize and track your inventory",
                      icon: "📦",
                      link: "#",
                    },
                    {
                      title: "Analytics & Reports",
                      description: "Understanding your yield data",
                      icon: "📊",
                      link: "#",
                    },
                  ].map((doc, index) => (
                    <a
                      key={index}
                      href={doc.link}
                      className="block p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-start space-x-4">
                        <span className="text-2xl">{doc.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                            {doc.title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {doc.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    API Documentation
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Looking to integrate with our API? Check out our developer
                    documentation.
                  </p>
                  <Button variant="secondary">View API Docs</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
