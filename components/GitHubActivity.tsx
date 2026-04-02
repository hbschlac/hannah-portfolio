interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: Week[];
}

async function getContributions(): Promise<ContributionCalendar | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          user(login: "hbschlac") {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
          }
        }`,
      }),
      cache: "force-cache",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data.user.contributionsCollection.contributionCalendar;
  } catch {
    return null;
  }
}

function getColor(count: number): string {
  if (count === 0) return "#E5E1D8";
  if (count <= 3) return "#F5E0E6";
  if (count <= 9) return "#EDBECC";
  if (count <= 19) return "#E8A5B4";
  return "#C4788A";
}

export default async function GitHubActivity() {
  const calendar = await getContributions();
  if (!calendar) return null;

  const { totalContributions, weeks } = calendar;
  const cellSize = 10;
  const gap = 2;
  const totalWidth = weeks.length * (cellSize + gap) - gap;
  const totalHeight = 7 * (cellSize + gap) - gap;

  return (
    <div className="mt-8">
      <p className="text-xs mb-2" style={{ color: "#8A8A8A" }}>
        github activity · {totalContributions} contributions this year
      </p>
      <svg
        width="100%"
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        style={{ display: "block", opacity: 0.9 }}
      >
        {weeks.map((week: Week, wi: number) =>
          week.contributionDays.map((day: ContributionDay, di: number) => (
            <rect
              key={`${wi}-${di}`}
              x={wi * (cellSize + gap)}
              y={di * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={2}
              fill={getColor(day.contributionCount)}
            >
              <title>
                {day.date}: {day.contributionCount} contribution
                {day.contributionCount !== 1 ? "s" : ""}
              </title>
            </rect>
          ))
        )}
      </svg>
    </div>
  );
}
