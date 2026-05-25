type Props = {
  finishedCount: number;
  yearlyGoal: number;
  goalProgressPercent: number;
  year: number;
  compact?: boolean;
};

export function YearlyRing({
  finishedCount,
  yearlyGoal,
  goalProgressPercent,
  year,
  compact = false,
}: Props) {
  const size = compact ? 92 : 120;
  const stroke = compact ? 8 : 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(goalProgressPercent, 100) / 100) * circumference;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div>
        <p className="text-xs text-muted-foreground">{year}년 독서 목표</p>
        <p className={compact ? "text-xl font-semibold" : "text-2xl font-semibold"}>
          {finishedCount}
          <span className="text-base font-normal text-muted-foreground">
            {" "}
            / {yearlyGoal}권
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          달성률 {goalProgressPercent.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
