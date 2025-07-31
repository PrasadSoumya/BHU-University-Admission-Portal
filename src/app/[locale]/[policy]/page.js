"use client"; // This component will run on the client side

import React from 'react';
import { useParams } from "next/navigation";

// Define translations for all policy pages
const policyContent = {
    "copyright-policy": {
        en: {
            title: "Copyright Policy",
            paragraphs: [
                "Material on this site is subject to copyright protection unless otherwise indicated. The material in form of file or printable matter may be downloaded without requiring specific prior permission.",
                "Any other proposed use of the material is subject to the approval of Central Admission Committee, Banaras Hindu University .",
                "Application for obtaining permission should be made to Central Admission Committee, Banaras Hindu University ."
            ]
        },
        "hi-IN": {
            title: "कॉपीराइट नीति",
            paragraphs: [
                "इस साइट पर सामग्री कॉपीराइट सुरक्षा के अधीन है जब तक कि अन्यथा इंगित न किया गया हो। फ़ाइल या मुद्रण योग्य सामग्री के रूप में सामग्री को विशिष्ट पूर्व अनुमति की आवश्यकता के बिना डाउनलोड किया जा सकता है।",
                "सामग्री के किसी भी अन्य प्रस्तावित उपयोग के लिए केंद्रीय प्रवेश समिति, बनारस हिंदू विश्वविद्यालय  की स्वीकृति आवश्यक है।",
                "अनुमति प्राप्त करने के लिए आवेदन केंद्रीय प्रवेश समिति, बनारस हिंदू विश्वविद्यालय  को किया जाना चाहिए।"
            ]
        }
    },
    "hyperlinking-policy": {
        en: {
            title: "Hyperlinking Policy",
            paragraphs: [
                "Links to other websites that have been included on this Portal are provided for public convenience only. Central Admission Committee, Banaras Hindu University is not responsible for the contents or reliability of linked websites and does not necessarily endorse the view expressed within them. We cannot guarantee the availability of such linked pages at all times. We do not permit our pages to be loaded into frames on your site. Our pages must load into a new opened browser window of the user."
            ]
        },
        "hi-IN": {
            title: "हाइपरलिंकिंग नीति",
            paragraphs: [
                "इस पोर्टल में शामिल अन्य वेबसाइटों के लिंक केवल सार्वजनिक सुविधा के लिए प्रदान किए गए हैं। केंद्रीय प्रवेश समिति, बनारस हिंदू विश्वविद्यालय लिंक की गई वेबसाइटों की सामग्री या विश्वसनीयता के लिए जिम्मेदार नहीं है और उनमें व्यक्त विचारों का आवश्यक रूप से समर्थन नहीं करता है। हम हर समय ऐसी लिंक की गई पृष्ठों की उपलब्धता की गारंटी नहीं दे सकते। हम अपने पृष्ठों को आपकी साइट पर फ़्रेम में लोड करने की अनुमति नहीं देते हैं। हमारे पृष्ठ उपयोगकर्ता के एक नए खुले ब्राउज़र विंडो में लोड होने चाहिए।"
            ]
        }
    },
    "terms-conditions": {
        en: {
            title: "Terms & Conditions",
            paragraphs: [
                "Welcome to the official website of Central Admission Committee, Banaras Hindu University . By accessing or using this website, you agree to be bound by these Terms & Conditions. All content provided on this website is for informational purposes only. The University makes no representations as to the accuracy or completeness of any information on this site or found by following any link on this site."
            ]
        },
        "hi-IN": {
            title: "नियम एवं शर्तें",
            paragraphs: [
                "बनारस हिंदू विश्वविद्यालय की आधिकारिक वेबसाइट में आपका स्वागत है। इस वेबसाइट तक पहुँचने या इसका उपयोग करके, आप इन नियमों और शर्तों से बाध्य होने के लिए सहमत हैं। इस वेबसाइट पर प्रदान की गई सभी सामग्री केवल सूचनात्मक उद्देश्यों के लिए है। विश्वविद्यालय इस साइट पर या इस साइट पर किसी भी लिंक का पालन करके पाई गई किसी भी जानकारी की सटीकता या पूर्णता के बारे में कोई प्रतिनिधित्व नहीं करता है।"
            ]
        }
    },
    "privacy-policy": {
        en: {
            title: "Privacy Policy",
            paragraphs: [
                "This Privacy Policy governs the manner in which Central Admission Committee, Banaras Hindu University collects, uses, maintains, and discloses information collected from users (each, a 'User') of the https://admission.bhu.ac.in website . This privacy policy applies to the Site and all products and services offered by Banaras Hindu University."
            ]
        },
        "hi-IN": {
            title: "गोपनीयता नीति",
            paragraphs: [
                "यह गोपनीयता नीति उस तरीके को नियंत्रित करती है जिसमें बकेंद्रीय प्रवेश समिति, बनारस हिंदू विश्वविद्यालय https://admission.bhu.ac.in वेबसाइट  के उपयोगकर्ताओं (प्रत्येक, एक 'उपयोगकर्ता') से एकत्रित जानकारी को एकत्र, उपयोग, बनाए रखता और प्रकट करता है। यह गोपनीयता नीति साइट और बनारस हिंदू विश्वविद्यालय द्वारा प्रदान किए गए सभी उत्पादों और सेवाओं पर लागू होती है।"
            ]
        }
    },
    "disclaimer": {
        en: {
            title: "Disclaimer",
            paragraphs: [
                "The information contained in this website is for general information purposes only. The information is provided by Central Admission Committee, Banaras Hindu University and while we endeavour to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk."
            ]
        },
        "hi-IN": {
            title: "अस्वीकरण",
            paragraphs: [
                "इस वेबसाइट में निहित जानकारी केवल सामान्य सूचना उद्देश्यों के लिए है। जानकारी केंद्रीय प्रवेश समिति, बनारस हिंदू विश्वविद्यालय द्वारा प्रदान की जाती है और जबकि हम जानकारी को अद्यतन और सही रखने का प्रयास करते हैं, हम वेबसाइट या जानकारी, उत्पादों, सेवाओं, या किसी भी उद्देश्य के लिए वेबसाइट पर निहित संबंधित ग्राफिक्स के संबंध में पूर्णता, सटीकता, विश्वसनीयता, उपयुक्तता या उपलब्धता के बारे में किसी भी प्रकार का कोई प्रतिनिधित्व या वारंटी, व्यक्त या निहित नहीं करते हैं। इस तरह की जानकारी पर आपका कोई भी भरोसा पूरी तरह से आपके अपने जोखिम पर है।"
            ]
        }
    },
    "help": {
        en: {
            title: "Help",
            paragraphs: [
                "If you have any questions or need assistance regarding the website, please refer to our Frequently Asked Questions (FAQ) section or contact us directly. We are here to help you navigate through the information and services provided on this portal."
            ]
        },
        "hi-IN": {
            title: "सहायता",
            paragraphs: [
                "यदि आपके पास वेबसाइट के संबंध में कोई प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया हमारे अक्सर पूछे जाने वाले प्रश्न (FAQ) अनुभाग देखें या सीधे हमसे संपर्क करें। हम आपको इस पोर्टल पर प्रदान की गई जानकारी और सेवाओं के माध्यम से नेविगेट करने में मदद करने के लिए यहां हैं।"
            ]
        }
    },
    // Default content if policy slug is not found
    "default": {
        en: {
            title: "Policy Not Found",
            paragraphs: [
                "The requested policy document could not be found. Please check the URL or navigate from the main menu."
            ]
        },
        "hi-IN": {
            title: "नीति नहीं मिली",
            paragraphs: [
                "अनुरोधित नीति दस्तावेज़ नहीं मिल सका। कृपया यूआरएल जांचें या मुख्य मेनू से नेविगेट करें।"
            ]
        }
    }
};

export default function PolicyPage() {
    const params = useParams();
    const locale = params.locale;
    const policySlug = params.policy; // This will be like 'copyright-policy', 'hyperlinking-policy', etc.

    // Determine the content to display based on policySlug and locale
    const currentPolicyData = policyContent[policySlug] || policyContent["default"];
    const t = currentPolicyData[locale === "hi-IN" ? "hi-IN" : "en"];

    return (
        <div className=" bg-gradient-to-br from-gray-100 via-white to-gray-200 py-16 px-6 sm:px-8 lg:px-10 font-sans">
            <div className=" mx-auto bg-white/80 backdrop-blur-md border border-gray-200 p-10 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-indigo-300">
                <h1 className="text-3xl font-black text-gray-900 mb-8 border-b-4 border-indigo-500 pb-3">
                    {t.title}
                </h1>

                <div className="space-y-6 text-xm text-gray-800 leading-relaxed">
                    {t.paragraphs.map((paragraph, index) => (
                        <p key={index} className="transition duration-300 hover:translate-x-1">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </div>

    );
}
