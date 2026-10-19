import React, { useMemo } from 'react'
import styles from './dateRange.module.scss'

const pad = (n) => String(n).padStart(2, '0')
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Each preset returns the calendar window it names, so "Last month" is the whole
// of last month rather than the previous 30 days.
export const PRESETS = {
    today: {
        label: 'Today',
        range: (now) => [new Date(now.getFullYear(), now.getMonth(), now.getDate()), now],
    },
    this_week: {
        label: 'This week',
        range: (now) => {
            const day = (now.getDay() + 6) % 7
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
            return [start, now]
        },
    },
    this_month: {
        label: 'This month',
        range: (now) => [new Date(now.getFullYear(), now.getMonth(), 1), now],
    },
    this_year: {
        label: 'This year',
        range: (now) => [new Date(now.getFullYear(), 0, 1), now],
    },
    all: {
        label: 'All time',
        range: () => [null, null],
    },
}

/**
 * Turn a preset key (or a custom start/end) into the query the KPI endpoints
 * expect. Presets resolve to explicit dates so the backend never has to guess.
 */
export function toQuery(value) {
    if (!value) return {}

    if (value.preset === 'custom') {
        const query = {}
        if (value.startDate) query.startDate = value.startDate
        if (value.endDate) query.endDate = value.endDate
        return query
    }

    const preset = PRESETS[value.preset]
    if (!preset) return {}

    const [start, end] = preset.range(new Date())
    // Sending nothing let most endpoints fall back to "this month", so
    // "All time" quietly showed only this month
    if (!start) return { period: 'all' }

    return { startDate: iso(start), endDate: iso(end) }
}

const DateRange = ({ value, onChange }) => {
    const current = value || { preset: 'this_month' }

    const summary = useMemo(() => {
        const query = toQuery(current)
        if (!query.startDate) return 'All time'
        return `${query.startDate} to ${query.endDate || 'today'}`
    }, [current])

    const pick = (preset) => onChange({ preset })

    return (
        <div className={styles.dateRange}>
            <div className={styles.presets}>
                {Object.entries(PRESETS).map(([key, preset]) => (
                    <button
                        key={key}
                        type="button"
                        className={current.preset === key ? styles.active : ''}
                        onClick={() => pick(key)}
                    >
                        {preset.label}
                    </button>
                ))}
                <button
                    type="button"
                    className={current.preset === 'custom' ? styles.active : ''}
                    onClick={() =>
                        onChange({
                            preset: 'custom',
                            startDate: current.startDate || iso(new Date()),
                            endDate: current.endDate || iso(new Date()),
                        })
                    }
                >
                    Custom
                </button>
            </div>

            {current.preset === 'custom' ? (
                <div className={styles.customInputs}>
                    <label>
                        From
                        <input
                            type="date"
                            value={current.startDate || ''}
                            max={current.endDate || undefined}
                            onChange={(e) =>
                                onChange({ ...current, startDate: e.target.value })
                            }
                        />
                    </label>
                    <label>
                        To
                        <input
                            type="date"
                            value={current.endDate || ''}
                            min={current.startDate || undefined}
                            onChange={(e) => onChange({ ...current, endDate: e.target.value })}
                        />
                    </label>
                </div>
            ) : (
                <div className={styles.summary}>{summary}</div>
            )}
        </div>
    )
}

export default DateRange
