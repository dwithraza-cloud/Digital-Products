import { useState, useEffect, useCallback, useMemo } from 'react';
import { LearnedMemoryRule } from '../types';

export interface MessageItem {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface RuleSuggestion {
  id: string;
  category: 'policy' | 'pricing' | 'delivery' | 'bank' | 'customer' | 'general';
  title: string;
  instruction: string;
  reason: string;
  confidence: number; // 0 - 100%
  sourceContext: string;
  suggestedAt: string;
}

interface UseAdaptiveRuleSuggestionsProps {
  messages: MessageItem[];
  learnedRules: LearnedMemoryRule[];
  onUpdateLearnedRules: (rules: LearnedMemoryRule[]) => void;
  enabled?: boolean;
}

// Pattern heuristics to detect recurring user intent & operational habits
const PATTERN_DETECTORS = [
  {
    category: 'pricing' as const,
    regex: /\b(student|students|discount|takhfeef|sasta|concession|promo|code|off)\b/i,
    title: 'Student & Academic Concession Rule',
    generateInstruction: (query: string) => {
      if (/\b\d{1,2}%\b/.test(query)) {
        const match = query.match(/(\d{1,2})%/);
        return `Apply a ${match ? match[1] : '10'}% discount to verified university and college students upon request.`;
      }
      return 'Offer a standard 10% educational discount to university students who provide a valid student ID.';
    },
    reason: 'Detected user frequency discussing student rates and promotional concessions.',
    baseConfidence: 90,
  },
  {
    category: 'delivery' as const,
    regex: /\b(fast|jaldi|urgent|fauran|10 min|5 min|minutes|instant|delivery time|timing)\b/i,
    title: 'Express Fulfillment Commitment',
    generateInstruction: (query: string) => {
      if (/\b\d{1,2}\s*(?:min|minutes|m)\b/i.test(query)) {
        const match = query.match(/(\d{1,2})\s*(?:min|minutes|m)/i);
        return `Maintain strict digital key fulfillment guarantee within ${match ? match[1] : '10'} minutes of payment verification.`;
      }
      return 'Guarantee digital software credential delivery within 10 minutes of manual payment verification.';
    },
    reason: 'Detected operational priority on fast turnaround and immediate delivery timing.',
    baseConfidence: 88,
  },
  {
    category: 'customer' as const,
    regex: /\b(agency|bulk|reseller|wholesale|corporate|multiple accounts|lot)\b/i,
    title: 'Agency & Bulk Tier Pricing',
    generateInstruction: () =>
      'Offer 15% wholesale concession when creative agencies or digital marketing teams purchase 3+ tool subscriptions in one order.',
    reason: 'Identified recurring queries regarding bulk accounts and multi-user agency pricing.',
    baseConfidence: 85,
  },
  {
    category: 'bank' as const,
    regex: /\b(bank|jazzcash|easypaisa|nayapay|account number|slip|screenshot|proof)\b/i,
    title: 'Payment Slip Priority Verification',
    generateInstruction: () =>
      'Cross-check bank transaction references with uploaded customer receipt screenshots before marking orders as Verified.',
    reason: 'Observed active focus on payment verification workflows and slip attachments.',
    baseConfidence: 92,
  },
  {
    category: 'policy' as const,
    regex: /\b(warranty|guarantee|replacement|refund|replace|password change|issue|login)\b/i,
    title: 'Full Replacement Warranty Policy',
    generateInstruction: () =>
      'Provide instant 1-to-1 account credential replacement within 30 days if a customer experiences access or password lockout.',
    reason: 'Detected concern for customer warranty support and post-sale replacement guarantees.',
    baseConfidence: 94,
  },
  {
    category: 'customer' as const,
    regex: /\b(whatsapp|phone|call|support|number|contact|rabta)\b/i,
    title: 'Direct WhatsApp Concierge Priority',
    generateInstruction: () =>
      'Direct all complex subscription queries and enterprise renewals to official WhatsApp live concierge support.',
    reason: 'Identified frequent interaction directing customers to WhatsApp support channels.',
    baseConfidence: 86,
  },
  {
    category: 'pricing' as const,
    regex: /\b(canva|chatgpt|netflix|prime|adobe|nordvpn|midjourney|youtube)\b/i,
    title: 'Competitor Match & Price Ceiling',
    generateInstruction: (query: string) => {
      const match = query.match(/(canva|chatgpt|netflix|prime|adobe|nordvpn|midjourney|youtube)/i);
      const name = match ? match[1].toUpperCase() : 'Core Software';
      return `Ensure ${name} subscription pricing stays competitive while preserving at least a 30% gross profit margin over wholesale cost.`;
    },
    reason: 'Detected ongoing price optimization and catalog adjustments for key software brands.',
    baseConfidence: 87,
  },
];

/**
 * useAdaptiveRuleSuggestions:
 * Scans user interactions with the agent, discovers behavioral patterns,
 * and automatically generates proactive rule proposals for the AI's learnedRules brain.
 */
export function useAdaptiveRuleSuggestions({
  messages,
  learnedRules,
  onUpdateLearnedRules,
  enabled = true,
}: UseAdaptiveRuleSuggestionsProps) {
  const [suggestedRules, setSuggestedRules] = useState<RuleSuggestion[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Scan conversations for candidate rules
  const scanConversations = useCallback(() => {
    if (!enabled || messages.length === 0) return;

    setIsScanning(true);

    try {
      const userMessages = messages.filter((m) => m.sender === 'user');
      const allUserText = userMessages.map((m) => m.text).join(' ');

      const newSuggestions: RuleSuggestion[] = [];

      for (const detector of PATTERN_DETECTORS) {
        // Test if user has interacted with this pattern
        const matchingMessages = userMessages.filter((m) => detector.regex.test(m.text));

        if (matchingMessages.length > 0) {
          const latestMatch = matchingMessages[matchingMessages.length - 1];
          const instruction = detector.generateInstruction(latestMatch.text);

          // Check if this rule or instruction is already present in learnedRules
          const alreadyLearned = learnedRules.some(
            (r) =>
              r.title.toLowerCase().includes(detector.title.toLowerCase()) ||
              r.instruction.toLowerCase().includes(instruction.toLowerCase().slice(0, 30)) ||
              (detector.category === r.category && r.title.toLowerCase().includes(detector.category))
          );

          // Generate stable suggestion ID
          const suggestionId = `sugg-${detector.category}-${detector.title.replace(/\s+/g, '-').toLowerCase()}`;

          if (!alreadyLearned && !dismissedIds.has(suggestionId)) {
            // Calculate dynamic confidence based on occurrence frequency
            const dynamicConfidence = Math.min(
              99,
              detector.baseConfidence + (matchingMessages.length - 1) * 3
            );

            newSuggestions.push({
              id: suggestionId,
              category: detector.category,
              title: detector.title,
              instruction,
              reason: `${detector.reason} (Detected in ${matchingMessages.length} interaction${
                matchingMessages.length > 1 ? 's' : ''
              })`,
              confidence: dynamicConfidence,
              sourceContext: latestMatch.text,
              suggestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          }
        }
      }

      setSuggestedRules(newSuggestions);
    } catch (err) {
      console.warn('Error scanning interactions for rule suggestions:', err);
    } finally {
      setIsScanning(false);
    }
  }, [messages, learnedRules, dismissedIds, enabled]);

  // Trigger scan whenever messages count or learnedRules change
  useEffect(() => {
    const timeout = setTimeout(() => {
      scanConversations();
    }, 400);

    return () => clearTimeout(timeout);
  }, [messages.length, learnedRules.length, scanConversations]);

  // Apply a single suggestion into the active learnedRules state
  const applySuggestion = useCallback(
    (suggestionId: string) => {
      const target = suggestedRules.find((s) => s.id === suggestionId);
      if (!target) return;

      const newRule: LearnedMemoryRule = {
        id: `rule-adaptive-${Date.now()}`,
        category: target.category,
        title: target.title,
        instruction: target.instruction,
        learnedAt: `Adapted from Conversation (${target.confidence}% match)`,
        source: 'chat_conversation',
        active: true,
      };

      onUpdateLearnedRules([newRule, ...learnedRules]);
      setSuggestedRules((prev) => prev.filter((s) => s.id !== suggestionId));
    },
    [suggestedRules, learnedRules, onUpdateLearnedRules]
  );

  // Dismiss a suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedIds((prev) => new Set(prev).add(suggestionId));
    setSuggestedRules((prev) => prev.filter((s) => s.id !== suggestionId));
  }, []);

  // Batch adopt all currently suggested rules
  const applyAllSuggestions = useCallback(() => {
    if (suggestedRules.length === 0) return;

    const newRules: LearnedMemoryRule[] = suggestedRules.map((s, idx) => ({
      id: `rule-adaptive-batch-${Date.now()}-${idx}`,
      category: s.category,
      title: s.title,
      instruction: s.instruction,
      learnedAt: `Adapted from Conversation (${s.confidence}%)`,
      source: 'chat_conversation',
      active: true,
    }));

    onUpdateLearnedRules([...newRules, ...learnedRules]);
    setSuggestedRules([]);
  }, [suggestedRules, learnedRules, onUpdateLearnedRules]);

  // Return counts & handlers
  const pendingCount = useMemo(() => suggestedRules.length, [suggestedRules]);

  return {
    suggestedRules,
    pendingCount,
    isScanning,
    applySuggestion,
    dismissSuggestion,
    applyAllSuggestions,
    rescan: scanConversations,
  };
}
