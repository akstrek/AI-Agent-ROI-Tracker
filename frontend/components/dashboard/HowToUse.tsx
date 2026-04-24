'use client'

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Terminal, GitBranch, Activity, Globe2, ArrowRight, ChevronDown, X, Zap } from 'lucide-react';

/* ─── Overlay detail data ─────────────────────────────────────────────── */

interface Field {
  name: string;
  type: string;
  description: string;
  example: string;
  impact?: string;
}

interface StepDetail {
  headline: string;
  fields: Field[];
  roiConnection: { title: string; body: string }[];
  cta: string;
  ctaToolId: string;
}

const STEP_DETAILS: StepDetail[] = [
  {
    headline:
      'The Command Terminal is Ergon\'s data intake layer. Every entry you submit becomes a data point in your ROI engine — the more complete and accurate each log, the richer your analytics.',
    fields: [
      {
        name: 'Task Descriptor',
        type: 'Text',
        description: 'A short label for what the agent actually did. This is free-text and becomes searchable context in your task history.',
        example: '"Drafted Q2 outreach email", "Summarised 40-page report"',
        impact: 'Identifies task patterns across nodes over time.',
      },
      {
        name: 'Node Assign',
        type: 'Select',
        description: 'Which AI agent or node performed the task. Ergon-Prime is your primary node, Synth-01 a secondary AI, Ghost-Node handles background/shadow tasks.',
        example: 'Ergon-Prime → high-volume core work',
        impact: 'Drives per-node stats in Team Aggregation.',
      },
      {
        name: 'Priority',
        type: 'Select',
        description: 'The urgency level of the task — CRITICAL, HIGH, or DEFAULT. Used to filter high-stakes work in future analytical queries.',
        example: 'CRITICAL for time-sensitive deliverables',
      },
      {
        name: 'Mode',
        type: 'Toggle',
        description: 'AI-Assist means the task was handled or meaningfully accelerated by AI. Human means it was done manually. The split reveals your actual AI utilisation rate.',
        example: 'AI-Assist: agent drafted it. Human: you wrote it with AI suggestions.',
        impact: 'Segmenting by mode shows where AI genuinely saves time vs. where it doesn\'t yet.',
      },
      {
        name: 'Time (Mins)',
        type: 'Number',
        description: 'How long the task took in minutes. This single field is the primary input for every time-based ROI metric in the Scorecard.',
        example: '24 → 24 minutes → 0.4 hours reclaimed',
        impact: 'Avg Time Saved and Total Hours Saved are computed directly from this field across COMPLETED tasks.',
      },
      {
        name: 'Experiment Link',
        type: 'Select',
        description: 'Tags this task to an active A/B experiment condition (Alpha – Flow A, Beta – Flow B, or None/Control). Tasks with a condition tag feed the Experiment Terminal\'s live comparison table.',
        example: 'Alpha – Flow A → shorter prompts. Beta – Flow B → chain-of-thought prompts.',
        impact: 'Without experiment tags, the A/B Terminal has no data to compare.',
      },
      {
        name: 'Status',
        type: 'Toggle',
        description: 'PENDING means the task is queued or in-progress. COMPLETED means it\'s done. Only COMPLETED tasks with a time value count toward ROI calculations.',
        example: 'Log as PENDING now, flip to COMPLETED once the agent finishes.',
        impact: 'Incomplete tasks inflate your Pending count and suppress your Completion Rate Delta.',
      },
    ],
    roiConnection: [
      {
        title: 'Time field → Avg Time Saved',
        body: 'The ROI Scorecard averages time_mins across all COMPLETED tasks in the selected period. Accurate time logging = accurate ROI.',
      },
      {
        title: 'Node field → Team Aggregation',
        body: 'Every node you assign tasks to automatically appears as a tracked node in the Team view with its own performance card.',
      },
      {
        title: 'Experiment Link → A/B Terminal',
        body: 'Tagged tasks flow directly into the Experiment Terminal\'s condition comparison. No tags = no experiment data.',
      },
      {
        title: 'Status → Completion Rate Delta',
        body: 'The ratio of COMPLETED to total tasks in a period determines your completion rate. The delta shows if that rate is rising or falling week over week.',
      },
    ],
    cta: 'Open Task Logging',
    ctaToolId: 'logging',
  },
  {
    headline:
      'The ROI Scorecard translates your logged tasks into four executive-level metrics. It compares the current period against the previous one of equal length — so every number you see is relative, not absolute.',
    fields: [
      {
        name: 'Period Toggle',
        type: 'Control',
        description: 'Filters all four metrics to the selected time window: Daily (last 24 h), Weekly (last 7 days), Monthly (last 30 days). Switching periods triggers a new data fetch.',
        example: 'Weekly is the recommended default for operational review.',
        impact: 'Each switch fires a roi_period_changed analytics event for usage tracking.',
      },
      {
        name: 'Avg Time Saved',
        type: 'Metric',
        description: 'The mean time_mins of all COMPLETED tasks in the current period. Shows how many minutes per task your AI layer is reclaiming on average.',
        example: '24m → your agents save 24 minutes per completed task this week.',
        impact: 'Low values indicate either short tasks or inaccurate time logging.',
      },
      {
        name: 'Completion Rate Delta',
        type: 'Metric',
        description: 'Current period completion rate minus the previous period\'s rate. A positive value means more tasks are reaching COMPLETED status proportionally.',
        example: '+18.4% → agents completed 18.4 percentage points more tasks than last week.',
        impact: 'The most actionable metric — negative delta is an early warning signal.',
      },
      {
        name: 'Trend Line',
        type: 'Visualisation',
        description: 'An SVG path plotting daily task counts across the period. Each point represents the number of tasks logged on that day. Rising slope = increasing throughput.',
        example: 'A flat line means consistent volume. A spike on Friday suggests batch logging.',
      },
      {
        name: 'Total Hours Saved',
        type: 'Metric',
        description: 'The cumulative sum of all completed task time_mins ÷ 60. This is your organisation-wide AI ROI headline — the total hours your AI layer has reclaimed.',
        example: '142.5 → 142.5 hours of human time reclaimed this period.',
        impact: 'Use this number in executive reports and investor updates.',
      },
    ],
    roiConnection: [
      {
        title: 'Delta → operational decision signal',
        body: 'If the delta drops, cross-reference with the Experiment Terminal to see if a recent workflow change caused the regression.',
      },
      {
        title: 'Period selection → benchmarking cadence',
        body: 'Run Daily for real-time ops monitoring, Weekly for team standups, Monthly for strategic reporting and board decks.',
      },
      {
        title: 'Trend Line → capacity planning',
        body: 'Consistent upward trend confirms AI adoption is growing. Plateau means you\'ve hit a ceiling — time to add new nodes or experiment with new workflows.',
      },
    ],
    cta: 'Open ROI Scorecard',
    ctaToolId: 'roi',
  },
  {
    headline:
      'The Experiment Terminal lets you run controlled A/B tests on your AI workflows. Deploy a named experiment, tag tasks to conditions when logging them, then watch the completion rates and speeds diverge in real time.',
    fields: [
      {
        name: 'Experiment Name',
        type: 'Text',
        description: 'A human-readable label for this test protocol. It appears as the active experiment title in the live results panel and in your analytics event history.',
        example: '"Prompt compression v2", "Chain-of-thought vs direct"',
      },
      {
        name: 'Start Date',
        type: 'Date',
        description: 'When the experiment protocol officially began. Used for reference and documentation — the system uses task creation timestamps for all data filtering.',
        example: 'Set to the day you changed your AI prompting strategy.',
      },
      {
        name: 'Condition Assignment',
        type: 'Select',
        description: 'The primary variable being tested. Latency Factor C optimises for speed, Yield Threshold for output quality, Strict Mode for rigid constraint adherence.',
        example: 'Latency Factor C → measure if faster responses reduce task completion time.',
        impact: 'This label is purely descriptive — it helps you remember what the experiment was testing.',
      },
      {
        name: 'Condition column (results table)',
        type: 'Display',
        description: 'The experiment arm — Alpha – Flow A or Beta – Flow B. Set via the Experiment Link field when logging each task. Tasks tagged to different conditions are split here.',
        example: 'Alpha = your new prompt strategy. Beta = the old baseline.',
      },
      {
        name: 'Task Count',
        type: 'Metric',
        description: 'Total tasks tagged to this condition. Needs meaningful volume (10+ tasks per condition) for results to be statistically reliable.',
        example: 'Alpha: 34 tasks, Beta: 31 tasks → balanced sample, results are trustworthy.',
      },
      {
        name: 'Avg Time',
        type: 'Metric',
        description: 'Mean time_mins of COMPLETED tasks in this condition. The condition with lower Avg Time is faster.',
        example: 'Alpha: 18m vs Beta: 26m → Alpha saves 8 minutes per task.',
        impact: '8 minutes × 100 tasks/month = 800 minutes = 13.3 hours reclaimed per month.',
      },
      {
        name: 'Completion Rate',
        type: 'Metric',
        description: 'Percentage of tasks in this condition that reached COMPLETED status. A higher rate means the workflow is more reliable.',
        example: 'Alpha: 82% vs Beta: 61% → Alpha completes 21% more tasks successfully.',
      },
      {
        name: 'Halt / Resume',
        type: 'Control',
        description: 'Pauses or resumes the active experiment\'s status field in the database. Does not delete data — safe to use during anomalous periods (holidays, outages, etc.).',
        example: 'Halt during a system migration to avoid contaminating results.',
      },
      {
        name: 'Network Sync Rate',
        type: 'Metric',
        description: 'Overall completion rate across ALL experiment-tagged tasks regardless of condition. A high sync rate (80%+) means your experiment is producing clean, usable data.',
        example: '74.5% → 74.5% of all experiment tasks are completing successfully.',
      },
    ],
    roiConnection: [
      {
        title: 'Winning condition → new workflow baseline',
        body: 'The condition with higher completion rate AND lower avg time becomes your new standard process. Update your node instructions to reflect the winning approach.',
      },
      {
        title: 'Time difference × volume = monthly ROI delta',
        body: 'If Alpha saves 8 min/task and you run 200 tasks/month, switching fully to Alpha saves 26.7 hours/month. Visible in Total Hours Saved within 4 weeks.',
      },
      {
        title: 'Sequential experiments → compounding gains',
        body: 'Each experiment builds on the last winning condition. Run one experiment per month and your ROI scorecard should show consistent positive delta quarter over quarter.',
      },
    ],
    cta: 'Open Experiment Terminal',
    ctaToolId: 'experiment',
  },
  {
    headline:
      'Team Aggregation gives you a cluster-level view of all AI nodes. Unlike the Scorecard (which shows aggregate totals), this view breaks performance down per agent so you can spot who\'s pulling weight and who needs attention.',
    fields: [
      {
        name: 'Active Nodes (header)',
        type: 'Metric',
        description: 'Count of distinct node_assign values across all your logged tasks. A node appears automatically after its first task is logged — no manual setup required.',
        example: '3 Active Nodes → Ergon-Prime, Synth-01, Ghost-Node are all in use.',
      },
      {
        name: 'Total Hrs Saved (header)',
        type: 'Metric',
        description: 'Sum of ALL completed task time_mins ÷ 60, across every node. This is the same number as the Scorecard\'s Total Hours Saved but scoped to all time, not just the current period.',
        example: '284.5 → your AI cluster has saved 284.5 hours of human labour total.',
      },
      {
        name: 'Pending Tasks (header)',
        type: 'Alert metric',
        description: 'Total tasks still in PENDING status across all nodes. A rising Pending count is an early warning — tasks are being created but not completing.',
        example: 'Pending > 20 → investigate which node is creating most of the backlog.',
        impact: 'High pending counts suppress your Completion Rate Delta in the Scorecard.',
      },
      {
        name: 'Avg Time (per-node card)',
        type: 'Metric',
        description: 'Mean time_mins of COMPLETED tasks for this specific node. Compare across nodes to identify which agent handles tasks fastest.',
        example: 'Ergon-Prime: 18m vs Synth-01: 34m → Ergon-Prime is twice as fast per task.',
      },
      {
        name: 'Delta (per-node card)',
        type: 'Metric',
        description: 'This node\'s completion rate in the current 7 days versus the previous 7 days. Positive = improving, negative = degrading.',
        example: '+12.3% → this node completed 12.3% more of its tasks than last week.',
        impact: 'A sustained negative delta on a node warrants prompt investigation before it drags down the Scorecard.',
      },
      {
        name: 'Hours (per-node card)',
        type: 'Metric',
        description: 'Total hours reclaimed by this specific node (all completed time_mins ÷ 60). Use this to justify which nodes should receive more task allocation.',
        example: 'Ghost-Node: 9.2h → this background agent has reclaimed 9 hours total.',
      },
      {
        name: 'Weekly Trend bars (per-node card)',
        type: 'Visualisation',
        description: 'A 5-day mini bar chart showing daily task count for this node over the last 5 days. The rightmost (today\'s) bar is always white and glowing.',
        example: 'Flat bars = consistent usage. Rising bars = accelerating adoption. Gaps = idle days.',
        impact: 'Spiky or irregular patterns suggest this node is being used reactively, not systematically.',
      },
    ],
    roiConnection: [
      {
        title: 'Per-node Hours → resource allocation decisions',
        body: 'Nodes generating the most hours saved should receive the highest-priority, highest-volume tasks. Low-hours nodes should be retrained or reassigned to a narrower task type.',
      },
      {
        title: 'Per-node Delta → early regression detection',
        body: 'A single node\'s negative delta may not show in the Scorecard yet, but catching it here lets you act before it compounds into a multi-week decline.',
      },
      {
        title: 'Pending count → bottleneck identification',
        body: 'Cross-reference the pending count with per-node trend bars. The node with the flattest trend and highest pending share is your bottleneck.',
      },
    ],
    cta: 'Open Team Aggregation',
    ctaToolId: 'team',
  },
];

/* ─── Card preview components (same as before) ───────────────────────── */

const PreviewLogging = () => (
  <div className="w-full bg-black/60 rounded-xl border border-[#7f8c8d]/20 p-3 font-mono text-[9px] space-y-1.5">
    <div className="flex items-center gap-2"><span className="text-[#7f8c8d]">NODE</span><span className="text-white bg-white/10 px-2 py-0.5 rounded">Ergon-Prime</span></div>
    <div className="flex items-center gap-2"><span className="text-[#7f8c8d]">PRIORITY</span><span className="text-[#FF3131] bg-[#FF3131]/10 px-2 py-0.5 rounded">CRITICAL</span></div>
    <div className="flex items-center gap-2"><span className="text-[#7f8c8d]">TIME</span><span className="text-white">24m</span></div>
    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="text-[#22c55e] flex items-center gap-1 pt-1 border-t border-white/5">
      <span>▶</span> Execute Log
    </motion.div>
  </div>
);

const PreviewROI = () => (
  <div className="w-full space-y-2">
    <div className="flex items-end justify-between h-12 gap-1">
      {[35, 55, 42, 70, 60, 88, 95].map((h, i, arr) => (
        <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
          className={`flex-1 rounded-t-sm ${i === arr.length - 1 ? 'bg-white shadow-[0_0_12px_white]' : 'bg-[#7f8c8d]/20'}`} />
      ))}
    </div>
    <div className="flex justify-between font-mono text-[8px] text-[#7f8c8d]">
      <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span className="text-white font-bold">NOW</span>
    </div>
    <div className="flex items-baseline gap-1.5 pt-1 border-t border-white/5">
      <motion.span animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} className="text-[#FF3131] font-brand font-bold text-xl drop-shadow-[0_0_8px_rgba(255,49,49,0.8)]">+18.4%</motion.span>
      <span className="font-mono text-[8px] text-[#7f8c8d]">completion delta</span>
    </div>
  </div>
);

const PreviewExperiment = () => (
  <div className="w-full space-y-2 font-mono text-[9px]">
    <div className="flex items-center gap-2 mb-1">
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-[#FF3131] shadow-[0_0_6px_#FF3131]" />
      <span className="text-[#7f8c8d] uppercase tracking-widest">Live</span>
    </div>
    {[{ label: 'Alpha — Flow A', rate: 78, color: 'bg-white shadow-[0_0_8px_white]' }, { label: 'Beta — Flow B', rate: 54, color: 'bg-[#FF3131] shadow-[0_0_8px_#FF3131]' }].map(cond => (
      <div key={cond.label} className="space-y-1">
        <div className="flex justify-between text-[#7f8c8d]"><span>{cond.label}</span><span className="text-white">{cond.rate}%</span></div>
        <div className="w-full bg-[#7f8c8d]/10 h-1.5 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} whileInView={{ width: `${cond.rate}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'circOut' }} className={`h-full rounded-full ${cond.color}`} />
        </div>
      </div>
    ))}
  </div>
);

const PreviewTeam = () => (
  <div className="w-full space-y-2">
    {[{ name: 'Ergon-Prime', hrs: 42, trend: [3, 5, 4, 7, 9] }, { name: 'Synth-01', hrs: 28, trend: [2, 3, 5, 4, 6] }, { name: 'Ghost-Node', hrs: 17, trend: [1, 2, 2, 3, 4] }].map(node => (
      <div key={node.name} className="flex items-center gap-3 bg-black/40 rounded-lg px-3 py-2 border border-[#7f8c8d]/10">
        <div className="w-1 h-5 rounded-full bg-[#FF3131] shadow-[0_0_6px_#FF3131] shrink-0" />
        <span className="font-mono text-[9px] text-white flex-1 truncate">{node.name}</span>
        <span className="font-mono text-[9px] text-[#7f8c8d]">{node.hrs}h</span>
        <div className="flex items-end gap-0.5 h-4">
          {node.trend.map((v, i) => (
            <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${(v / 9) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
              className={`w-1 rounded-sm ${i === node.trend.length - 1 ? 'bg-white' : 'bg-[#7f8c8d]/30'}`} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ─── Step definitions ────────────────────────────────────────────────── */

const STEPS = [
  { number: '01', icon: Terminal, title: 'Log Every Task', subtitle: 'Task Logging & Telemetry', description: 'Open the Command Terminal and record each agent action — assign it to a node, set priority, log time spent, and mark it AI-Assist or Human.', detail: 'Every log entry feeds your ROI engine in real time.', accent: 'white' as const, preview: <PreviewLogging /> },
  { number: '02', icon: GitBranch, title: 'Measure ROI', subtitle: 'AI Agent ROI Scorecard', description: 'Switch between Daily, Weekly, and Monthly periods to see average time saved per task, completion rate delta vs. the previous period, and a live trend line.', detail: 'A positive delta means your agents are compounding efficiency.', accent: '#FF3131' as const, preview: <PreviewROI /> },
  { number: '03', icon: Activity, title: 'Run Experiments', subtitle: 'A/B Experiment Terminal', description: 'Deploy experiments to compare two AI workflow conditions head-to-head. Tag tasks to each condition and watch completion rates, speed, and task counts diverge live.', detail: 'Pause or resume protocols at any time without losing data.', accent: 'white' as const, preview: <PreviewExperiment /> },
  { number: '04', icon: Globe2, title: 'Scale the Cluster', subtitle: 'Agentic Team Aggregation', description: 'View your entire AI node cluster at a glance. Each node shows hours saved, weekly task trends, and completion delta — so you know exactly where to allocate next.', detail: 'Every node. Every task. One unified command view.', accent: '#FF3131' as const, preview: <PreviewTeam /> },
];

/* ─── Overlay ─────────────────────────────────────────────────────────── */

const TYPE_COLORS: Record<string, string> = {
  Text: 'bg-white/5 text-white/60 border-white/10',
  Number: 'bg-white/5 text-white/60 border-white/10',
  Select: 'bg-[#FF3131]/10 text-[#FF3131] border-[#FF3131]/20',
  Toggle: 'bg-[#FF3131]/10 text-[#FF3131] border-[#FF3131]/20',
  Control: 'bg-white/5 text-white/60 border-white/10',
  Metric: 'bg-white/5 text-[#22c55e] border-[#22c55e]/20',
  'Alert metric': 'bg-[#FF3131]/10 text-[#FF3131] border-[#FF3131]/20',
  Visualisation: 'bg-white/5 text-white/40 border-white/10',
  Display: 'bg-white/5 text-white/40 border-white/10',
  Date: 'bg-white/5 text-white/60 border-white/10',
};

function StepOverlay({ stepIdx, onClose, onOpen }: { stepIdx: number; onClose: () => void; onOpen: (id: string) => void }) {
  const step = STEPS[stepIdx];
  const detail = STEP_DETAILS[stepIdx];
  const Icon = step.icon;
  const accentIsRed = step.accent === '#FF3131';

  return (
    <motion.div
      key="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] bg-[#020202]/95 backdrop-blur-3xl overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 24 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-full w-full max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col gap-12"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0"
              style={{
                borderColor: accentIsRed ? 'rgba(255,49,49,0.3)' : 'rgba(255,255,255,0.15)',
                background: '#0a0a0a',
                boxShadow: accentIsRed ? '0 0 30px rgba(255,49,49,0.15)' : '0 0 30px rgba(255,255,255,0.08)',
              }}
            >
              <Icon className="w-6 h-6" style={{ color: step.accent }} />
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#7f8c8d] mb-1">
                Step {step.number} · {step.subtitle}
              </p>
              <h2 className="text-3xl md:text-4xl font-brand font-bold text-white tracking-tight">
                {step.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-10 h-10 rounded-full border border-[#7f8c8d]/30 bg-white/5 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all duration-300 mt-1"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Red underline */}
        <div className="h-[1px] w-full bg-gradient-to-r from-[#FF3131]/40 via-[#7f8c8d]/20 to-transparent" />

        {/* Headline */}
        <p className="text-[#7f8c8d] text-base md:text-lg leading-relaxed font-light">
          {detail.headline}
        </p>

        {/* Fields section */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#7f8c8d] mb-6">
            Fields & Controls
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detail.fields.map((field) => (
              <div
                key={field.name}
                className="bg-[#0a0a0a]/60 border border-[#7f8c8d]/15 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white font-brand font-bold text-sm tracking-tight">{field.name}</span>
                  <span
                    className={`font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded border ${TYPE_COLORS[field.type] ?? 'bg-white/5 text-white/40 border-white/10'}`}
                  >
                    {field.type}
                  </span>
                </div>
                <p className="text-[#7f8c8d] text-[0.8rem] leading-relaxed">{field.description}</p>
                <div className="bg-black/40 rounded-lg px-3 py-2 border border-[#7f8c8d]/10">
                  <p className="font-mono text-[8px] text-[#7f8c8d]/60 uppercase tracking-widest mb-1">Example</p>
                  <p className="font-mono text-[9px] text-white/70">{field.example}</p>
                </div>
                {field.impact && (
                  <div className="flex items-start gap-2 pt-1 border-t border-[#7f8c8d]/10">
                    <Zap className="w-3 h-3 text-[#FF3131] shrink-0 mt-0.5" />
                    <p className="text-[9px] font-mono text-[#FF3131]/70 italic leading-relaxed">{field.impact}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ROI connection section */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#7f8c8d] mb-6">
            How this feeds Agent ROI
          </p>
          <div className="flex flex-col gap-4">
            {detail.roiConnection.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-4 items-start bg-[#0a0a0a]/40 border border-[#7f8c8d]/15 rounded-2xl p-5 hover:border-white/20 transition-all duration-300"
              >
                <div
                  className="w-1 shrink-0 self-stretch rounded-full mt-0.5"
                  style={{ background: accentIsRed ? '#FF3131' : 'white', boxShadow: accentIsRed ? '0 0 8px #FF3131' : '0 0 8px white', minHeight: '100%' }}
                />
                <div>
                  <p className="text-white font-brand font-bold text-sm mb-1.5 tracking-tight">{item.title}</p>
                  <p className="text-[#7f8c8d] text-[0.8rem] leading-relaxed">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center pt-4 border-t border-[#7f8c8d]/10">
          <button
            onClick={() => { onClose(); onOpen(detail.ctaToolId); }}
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-brand font-bold text-[10px] uppercase tracking-[0.25em] shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:scale-[1.03] transition-all duration-300"
          >
            {detail.cta} <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d] hover:text-white transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */

export const HowToUse = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <>
      <AnimatePresence>
        {activeStep !== null && (
          <StepOverlay
            stepIdx={activeStep}
            onClose={() => setActiveStep(null)}
            onOpen={(id) => { setActiveStep(null); onSelect(id); }}
          />
        )}
      </AnimatePresence>

      <section id="how-to-use" className="w-full max-w-[900px] mx-auto px-4 pb-40 mt-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#7f8c8d] mb-4">Getting Started</p>
          <h2 className="text-4xl md:text-5xl font-brand font-bold text-white tracking-tight">How to use Ergon</h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-5 w-10 h-[2px] bg-[#FF3131] mx-auto shadow-[0_0_10px_#FF3131]"
          />
        </motion.div>

        {/* Desktop connector line */}
        <div className="hidden md:block relative h-0 mb-0 z-0">
          <div className="absolute top-[60px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-[1px]">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
              style={{ transformOrigin: 'left' }}
              className="w-full h-full border-t border-dashed border-[#7f8c8d]/25"
            />
            <motion.div
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
            />
          </div>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative z-10">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const accentIsRed = step.accent === '#FF3131';
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.12 }}
                className="group flex flex-col gap-4 cursor-pointer"
                onClick={() => setActiveStep(idx)}
              >
                {/* Icon bubble */}
                <div className="flex flex-col items-center md:items-start">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500 group-hover:scale-110 bg-[#0a0a0a]"
                    style={{
                      borderColor: accentIsRed ? 'rgba(255,49,49,0.3)' : 'rgba(255,255,255,0.15)',
                      boxShadow: accentIsRed ? '0 0 20px rgba(255,49,49,0.15)' : '0 0 20px rgba(255,255,255,0.1)',
                    }}
                  >
                    <Icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110" style={{ color: step.accent }} />
                  </div>
                  <span className="font-mono text-[8px] text-[#7f8c8d]/40 tracking-[0.3em] mt-2 text-center md:text-left">
                    STEP {step.number}
                  </span>
                </div>

                {/* Card */}
                <div className="flex-1 bg-[#0a0a0a]/40 backdrop-blur-xl border border-[#7f8c8d]/20 rounded-2xl p-5 flex flex-col gap-4 group-hover:border-white/30 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.06)] transition-all duration-500 relative overflow-hidden">
                  {/* Expand hint */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-5 h-5 rounded-full border border-[#7f8c8d]/40 flex items-center justify-center">
                      <ArrowRight className="w-2.5 h-2.5 text-[#7f8c8d] -rotate-45" />
                    </div>
                  </div>

                  <div>
                    <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#7f8c8d] mb-1.5">{step.subtitle}</p>
                    <h3 className="text-base font-brand font-bold text-white tracking-tight">{step.title}</h3>
                  </div>

                  <div className="w-full">{step.preview}</div>

                  <p className="text-[#7f8c8d] text-[0.78rem] leading-relaxed">{step.description}</p>

                  <p
                    className="text-[9px] font-mono border-t border-[#7f8c8d]/10 pt-3 italic"
                    style={{ color: accentIsRed ? 'rgba(255,49,49,0.7)' : 'rgba(255,255,255,0.3)' }}
                  >
                    {step.detail}
                  </p>

                  {/* Click prompt */}
                  <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#7f8c8d]/30 group-hover:text-[#7f8c8d]/70 transition-colors duration-300 text-center">
                    Click to learn more →
                  </p>
                </div>

                {/* Mobile connector */}
                {idx < STEPS.length - 1 && (
                  <div className="md:hidden flex justify-center">
                    <ChevronDown className="w-4 h-4 text-[#7f8c8d]/30" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 bg-[#0a0a0a]/40 backdrop-blur-xl border border-[#7f8c8d]/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-5 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.04)] transition-all duration-500"
        >
          <div>
            <p className="text-white font-brand font-bold text-lg tracking-tight">Ready to track your first task?</p>
            <p className="text-[#7f8c8d] text-[0.8rem] font-mono mt-1">
              Open the Command Terminal and execute your first log — it takes under 30 seconds.
            </p>
          </div>
          <button
            onClick={() => onSelect('logging')}
            className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-brand font-bold text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-[1.03] transition-all duration-300"
          >
            Open Task Log <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </section>
    </>
  );
};
