import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useMemo } from "react";

export interface RawGroup {
    id: number | string;
    details?: string;
    name?: string; // por si tu backend usa otro campo
}

export interface GroupOption {
    id: string;
    label: string;
}

interface GroupSelectProps {
    /** id seleccionado (string). Usa '' para vacío */
    value: string;
    /** Lista cruda desde backend */
    groups: RawGroup[] | undefined | null;
    /** Callback con el id seleccionado (string) o '' si se limpia */
    onChange: (id: string) => void;

    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    error?: boolean;
    helperText?: string;
    fullWidth?: boolean;
    size?: "small" | "medium";
}

/** Mapea {id, details|name} -> {id:string, label:string} con filtro de falsy */
function useMappedOptions(groups: RawGroup[] | undefined | null): GroupOption[] {
    return useMemo(() => {
        if (!Array.isArray(groups)) return [];
        return groups
            .map(g => {
                const id = String(g.id);
                const label = (g.details ?? g.name ?? "").trim();
                if (!label) return null;
                return { id, label };
            })
            .filter((x): x is GroupOption => !!x);
    }, [groups]);
}

/**
 * GroupSelect: Autocomplete controlado por id.
 * - value es el id (string)
 * - onChange devuelve el id (string) o '' si se limpia
 */
export default function GroupSelect({
    value,
    groups,
    onChange,
    label = "Grupo Presupuestario",
    placeholder = "Buscar grupo...",
    required = false,
    disabled = false,
    loading = false,
    error = false,
    helperText,
    fullWidth = true,
    size = "small",
}: GroupSelectProps) {
    const options = useMappedOptions(groups);

    // Option actual desde el id
    const current = useMemo(
        () => options.find(o => o.id === value) ?? null,
        [options, value]
    );

    return (
        <Autocomplete
            value={current}
            onChange={(_, newVal) => onChange(newVal?.id ?? "")}
            options={options}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            disabled={disabled}
            loading={loading}
            fullWidth={fullWidth}
            size={size}
            clearOnBlur={false}
            handleHomeEndKeys
            autoHighlight
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    required={required}
                    error={error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress size={18} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
}
