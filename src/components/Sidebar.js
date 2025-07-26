"use client";
import { useState, useEffect } from "react";
import ProgramDetails from "./ProgramDetails";

export default function Sidebar({ locale }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeMainTab, setActiveMainTab] = useState('programs');

    const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
    const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    const translations = {
        en: {
            programNavigator: "Program Navigator",
            programs: "Programs",
            howToApply: "How to Apply",
            loading: "Loading programs...",
            error: "Error loading program data!",
            noContent: "No content available for this section.",
            programTypeLabel: "Program Type",
            levelLabel: "Level",
            mainContentLabel: "Program Details and Application Information",
            tabProgramsLabel: "View Programs",
            tabHowToApplyLabel: "View How to Apply Information"
        },
        "hi-IN": {
            programNavigator: "प्रोग्राम नेविगेटर",
            programs: "प्रोग्राम",
            howToApply: "आवेदन कैसे करें",
            loading: "प्रोग्राम लोड हो रहे हैं...",
            error: "प्रोग्राम डेटा लोड करने में त्रुटि!",
            noContent: "इस अनुभाग के लिए कोई सामग्री उपलब्ध नहीं है।",
            programTypeLabel: "प्रोग्राम प्रकार",
            levelLabel: "स्तर",
            mainContentLabel: "प्रोग्राम विवरण और आवेदन जानकारी",
            tabProgramsLabel: "प्रोग्राम देखें",
            tabHowToApplyLabel: "आवेदन कैसे करें जानकारी देखें"
        }
    };

    const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

    useEffect(() => {
        const GET_PROGRAM_ITEMS_QUERY = `
            query GetPorgamItems($locale : String!) {
                sidebars_connection(
                    filters: { isVisible: { eq: true }, locale: { eq: $locale } }
                ) {
                    nodes {
                        documentId
                        programType
                        visibleProgramType
                        level
                        visibleLevel
                        isVisible
                        programOrder
                        levelOrder
                        content
                    }
                }
            }
        `;

        const fetchProgramTypes = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(graphqlApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + strapiToken
                    },
                    body: JSON.stringify({
                        query: GET_PROGRAM_ITEMS_QUERY,
                        variables: { locale }
                    }),
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error("GraphQL API Error Response:", errorBody);
                    throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
                }

                const json = await response.json();

                if (json.errors) {
                    console.error("GraphQL Errors:", json.errors);
                    throw new Error(`GraphQL Errors: ${JSON.stringify(json.errors)}`);
                }

                setData(json.data);
            } catch (err) {
                console.error("Error fetching sidebar items:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgramTypes();
    }, [graphqlApiUrl, strapiToken, locale]);

    const [groupedPrograms, setGroupedPrograms] = useState([]);
    const [activeProgram, setActiveProgram] = useState(null);
    const [activeLevel, setActiveLevel] = useState(null);

    useEffect(() => {
        if (data?.sidebars_connection?.nodes) {
            const programsMap = new Map();

            data.sidebars_connection.nodes.forEach(item => {
                if (!programsMap.has(item.programType)) {
                    programsMap.set(item.programType, {
                        programType: item.programType,
                        visibleProgramType: item.visibleProgramType,
                        programOrder: item.programOrder,
                        content: item.content, // This content is for the program type itself, not levels
                        levels: []
                    });
                }
                programsMap.get(item.programType).levels.push({
                    documentId: item.documentId,
                    level: item.level,
                    visibleLevel: item.visibleLevel,
                    levelOrder: item.levelOrder,
                    content: item.content // This content is for the specific level
                });
            });

            const sortedPrograms = Array.from(programsMap.values())
                .sort((a, b) => a.programOrder - b.programOrder)
                .map(program => ({
                    ...program,
                    levels: program.levels.sort((a, b) => a.levelOrder - b.levelOrder)
                }));

            setGroupedPrograms(sortedPrograms);

            if (sortedPrograms.length > 0) {
                const firstProgram = sortedPrograms[0];
                const firstLevel = firstProgram.levels?.[0];

                setActiveProgram(firstProgram.programType);
                if (firstLevel) {
                    setActiveLevel(firstLevel.level);
                }
            }
        }
    }, [data]);

    const handleProgramClick = (programType) => {
        setActiveProgram(prev => (prev === programType ? null : programType));
        setActiveLevel(null);
    };

    const handleLevelClick = (programType, levelDocumentId) => {
        setActiveProgram(programType);
        setActiveLevel(levelDocumentId);
    };

    if (loading) {
        return (
            <div className="p-4 bg-gray-50 min-h-screen font-sans text-center text-gray-600" role="status" aria-live="polite">
                {t.loading}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-gray-50 min-h-screen font-sans text-center text-red-600" role="alert" aria-live="assertive">
                {t.error}
            </div>
        );
    }

    const selectedProgram = groupedPrograms.find(p => p.programType === activeProgram);
    const selectedLevel = selectedProgram?.levels.find(l => l.level === activeLevel);
    const visibleProgramType = selectedProgram?.visibleProgramType || '';
    const visibleLevel = selectedLevel?.visibleLevel || '';

    return (
        <section className="p-2 bg-gray-500 font-sans grid grid-cols-1 md:grid-cols-12 gap-4" aria-label="Program Information Navigator">
            <aside className="col-span-12 md:col-span-2 bg-white border rounded-lg p-4 shadow-sm mb-4 md:mb-0" aria-label={t.programNavigator}>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{t.programNavigator}</h2>
                <nav aria-label="Program Types and Levels">
                    <ul className="space-y-2 text-lg" id="degreeMenu">
                        {groupedPrograms.map(program => (
                            <li key={program.programType}>
                                <button
                                    onClick={() => handleProgramClick(program.programType)}
                                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out
                                    ${activeProgram === program.programType
                                            ? 'bg-[#a54417] text-white shadow-md'
                                            : 'text-gray-700 hover:bg-[#a54417] hover:text-white hover:shadow-md'}
                                    focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75`}
                                    aria-expanded={activeProgram === program.programType}
                                    aria-controls={`levels-for-${program.programType}`}
                                    aria-label={`${t.programTypeLabel}: ${program.visibleProgramType}`}
                                >
                                    {program.visibleProgramType}
                                </button>
                                {activeProgram === program.programType && program.levels.length > 0 && (
                                    <ul id={`levels-for-${program.programType}`} className="pl-6 mt-2 space-y-1 text-base" role="group" aria-label={`${program.visibleProgramType} Levels`}>
                                        {program.levels.map(levelItem => (
                                            <li key={levelItem.documentId}>
                                                <button
                                                    onClick={() => handleLevelClick(program.programType, levelItem.level)}
                                                    className={`w-full text-left px-3 py-1.5 rounded-md transition-all duration-200 ease-in-out
                                                    ${activeLevel === levelItem.level
                                                            ? 'bg-orange-400 text-white'
                                                            : 'text-gray-600 hover:bg-orange-200 hover:text-gray-800'}
                                                    focus:outline-none focus:ring-1 focus:ring-orange-300 focus:ring-opacity-75`}
                                                    aria-current={activeLevel === levelItem.level ? "true" : undefined}
                                                    aria-label={`${t.levelLabel}: ${levelItem.visibleLevel}`}
                                                >
                                                    {levelItem.visibleLevel}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <main className="col-span-12 md:col-span-10 bg-white rounded-lg shadow p-4 md:p-6" aria-label={t.mainContentLabel}>
                <div role="tablist" className="flex flex-wrap items-center gap-4 mb-4 border-b pb-2">
                    <button
                        onClick={() => setActiveMainTab('programs')}
                        id="tab-program"
                        role="tab"
                        aria-controls="program-section"
                        aria-selected={activeMainTab === 'programs'}
                        tabIndex={activeMainTab === 'programs' ? 0 : -1}
                        className={`text-lg md:text-xl font-bold border-b-4 pb-2
                        ${activeMainTab === 'programs'
                                ? 'border-orange-500 text-[#FF6F00]'
                                : 'border-transparent text-gray-500 hover:text-[#FF6F00]'}
                        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2`}
                        aria-label={t.tabProgramsLabel}
                    >
                        {t.programs}
                    </button>
                    <button
                        onClick={() => setActiveMainTab('apply')}
                        id="tab-apply"
                        role="tab"
                        aria-controls="apply-section"
                        aria-selected={activeMainTab === 'apply'}
                        tabIndex={activeMainTab === 'apply' ? 0 : -1}
                        className={`text-lg md:text-xl font-bold border-b-4 pb-2
                        ${activeMainTab === 'apply'
                                ? 'border-orange-500 text-[#FF6F00]'
                                : 'border-transparent text-gray-500 hover:text-[#FF6F00]'}
                        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2`}
                        aria-label={t.tabHowToApplyLabel}
                    >
                        {t.howToApply}
                    </button>
                </div>

                {activeMainTab === 'programs' && (
                    <div id="program-section" role="tabpanel" aria-labelledby="tab-program" tabIndex={0}>
                        <div className="overflow-x-auto">
                            <ProgramDetails
                                programType={activeProgram}
                                level={activeLevel}
                                visibleProgramType={visibleProgramType}
                                visibleLevel={visibleLevel}
                                locale={locale}
                            />
                        </div>
                    </div>
                )}

                {activeMainTab === 'apply' && (
                    <div id="apply-section" role="tabpanel" aria-labelledby="tab-apply" tabIndex={0} className="text-sm w-full leading-6 space-y-2">
                        {selectedLevel?.content ? (
                            <div className="apply-content text-gray-700" dangerouslySetInnerHTML={{ __html: selectedLevel.content }} role="document" />
                        ) : (
                            <p className="text-gray-700" role="status" aria-live="polite">{t.noContent}</p>
                        )}
                    </div>
                )}
            </main>
        </section>
    );
}