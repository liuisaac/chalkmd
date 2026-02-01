import { useState, useEffect, useRef, useCallback } from "react";
import { useVault } from "../../../VaultProvider";
import { Search, FileText, X } from "lucide-react";

const SearchPanel = ({ onFileClick }) => {
    const { files, readFile, setCurrentFile, setContent } = useVault();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [expandedResults, setExpandedResults] = useState(new Set());
    const inputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Parse query into keywords (order-independent matching)
    const parseKeywords = (query) => {
        return query
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 0);
    };

    // Check if a line contains all keywords (order-independent)
    const matchesAllKeywords = (line, keywords) => {
        const lowerLine = line.toLowerCase();
        return keywords.every(keyword => lowerLine.includes(keyword));
    };

    // Debounced search function
    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const searchResults = [];
        const keywords = parseKeywords(searchQuery);

        // Get all markdown files
        const mdFiles = files.filter(f => !f.isDir && f.path.endsWith(".md"));

        for (const file of mdFiles) {
            try {
                const content = await readFile(file.path);
                const lines = content.split("\n");
                const matches = [];

                lines.forEach((line, index) => {
                    if (matchesAllKeywords(line, keywords)) {
                        // Get surrounding context
                        const contextBefore = index > 0 ? lines[index - 1] : "";
                        const contextAfter = index < lines.length - 1 ? lines[index + 1] : "";
                        
                        matches.push({
                            lineNumber: index + 1,
                            line: line.trim(),
                            contextBefore: contextBefore.trim(),
                            contextAfter: contextAfter.trim(),
                        });
                    }
                });

                if (matches.length > 0) {
                    searchResults.push({
                        file: file,
                        fileName: file.name || file.path.split("/").pop(),
                        matches: matches,
                        totalMatches: matches.length,
                    });
                }
            } catch (err) {
                console.error(`Error reading file ${file.path}:`, err);
            }
        }

        // Sort by number of matches (most matches first)
        searchResults.sort((a, b) => b.totalMatches - a.totalMatches);
        
        setResults(searchResults);
        setIsSearching(false);
        
        // Auto-expand first few results
        const initialExpanded = new Set(searchResults.slice(0, 3).map(r => r.file.path));
        setExpandedResults(initialExpanded);
    }, [files, readFile]);

    // Handle search input with debounce
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.trim()) {
            setIsSearching(true);
            searchTimeoutRef.current = setTimeout(() => {
                performSearch(query);
            }, 200);
        } else {
            setResults([]);
            setIsSearching(false);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [query, performSearch]);

    const toggleExpanded = (filePath) => {
        setExpandedResults(prev => {
            const next = new Set(prev);
            if (next.has(filePath)) {
                next.delete(filePath);
            } else {
                next.add(filePath);
            }
            return next;
        });
    };

    const handleResultClick = async (file) => {
        try {
            const content = await readFile(file.path);
            setCurrentFile(file.path);
            setContent(content);
        } catch (err) {
            console.error("Error opening file:", err);
        }
    };

    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const highlightMatch = (text, query) => {
        if (!query.trim()) return text;
        
        const keywords = parseKeywords(query);
        if (keywords.length === 0) return text;
        
        // Create a regex that matches any of the keywords
        const pattern = keywords.map(k => escapeRegExp(k)).join("|");
        const regex = new RegExp(`(${pattern})`, "gi");
        
        const parts = text.split(regex);
        return parts.map((part, i) => {
            const isMatch = keywords.some(k => part.toLowerCase() === k.toLowerCase());
            return isMatch 
                ? <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5">{part}</mark>
                : part;
        });
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        inputRef.current?.focus();
    };

    const totalMatches = results.reduce((sum, r) => sum + r.totalMatches, 0);

    return (
        <div className="flex flex-col h-full ml-10">
            {/* Search Input */}
            <div className="px-3 py-2 border-b border-[#e0e0e0]">
                <div className="relative">
                    <Search 
                        size={14} 
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search in vault..."
                        className="w-full pl-8 pr-8 py-1.5 text-sm bg-white border border-[#e0e0e0] rounded-md 
                                   focus:outline-none focus:ring-1 focus:ring-[#8250ff] focus:border-[#8250ff]
                                   placeholder:text-gray-400 text-gray-700"
                    />
                    {query && (
                        <button 
                            onClick={clearSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 
                                       hover:text-gray-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                
                {/* Search Stats */}
                {query && !isSearching && (
                    <div className="mt-1.5 text-xs text-gray-500">
                        {results.length > 0 ? (
                            <span>{totalMatches} match{totalMatches !== 1 ? "es" : ""} in {results.length} file{results.length !== 1 ? "s" : ""}</span>
                        ) : (
                            <span>No results found</span>
                        )}
                    </div>
                )}
                
                {isSearching && (
                    <div className="mt-1.5 text-xs text-gray-500 flex items-center gap-1.5">
                        <div className="w-3 h-3 border-2 border-gray-300 border-t-[#8250ff] rounded-full animate-spin" />
                        <span>Searching...</span>
                    </div>
                )}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto custom-sidebar-scrollbar">
                {results.length === 0 && query && !isSearching && (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">No matches found</p>
                        <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                )}

                {!query && (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">Search your vault</p>
                        <p className="text-xs mt-1">Results appear as you type</p>
                    </div>
                )}

                {results.map((result) => (
                    <div key={result.file.path} className="border-b border-[#f0f0f0] last:border-b-0">
                        {/* File Header */}
                        <button
                            onClick={() => toggleExpanded(result.file.path)}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-[#f8f8f8] 
                                       transition-colors text-left group"
                        >
                            <FileText size={14} className="text-gray-400 flex-shrink-0" />
                            <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                                {result.fileName.replace(/\.md$/, "")}
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                {result.totalMatches}
                            </span>
                            <svg 
                                className={`w-3 h-3 text-gray-400 transition-transform ${
                                    expandedResults.has(result.file.path) ? "rotate-90" : ""
                                }`}
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                            >
                                <polyline points="9,18 15,12 9,6" />
                            </svg>
                        </button>

                        {/* Matches List */}
                        {expandedResults.has(result.file.path) && (
                            <div className="bg-[#fafafa]">
                                {result.matches.slice(0, 10).map((match, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleResultClick(result.file)}
                                        className="w-full px-3 py-2 pl-8 text-left hover:bg-[#f0f0f0] 
                                                   transition-colors border-t border-[#f0f0f0] first:border-t-0"
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs text-gray-400 font-mono mt-0.5 flex-shrink-0">
                                                {match.lineNumber}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                {match.contextBefore && (
                                                    <p className="text-xs text-gray-400 truncate mb-0.5">
                                                        {match.contextBefore}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-700 truncate">
                                                    {highlightMatch(match.line, query)}
                                                </p>
                                                {match.contextAfter && (
                                                    <p className="text-xs text-gray-400 truncate mt-0.5">
                                                        {match.contextAfter}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {result.matches.length > 10 && (
                                    <div className="px-8 py-1.5 text-xs text-gray-400 border-t border-[#f0f0f0]">
                                        +{result.matches.length - 10} more matches
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchPanel;
