import { FormEvent, useCallback, useState } from "react";
import { FormMaterialModel, GroupModel, MaterialModel, FormMaterialValidate } from "../../../../models";
import { useForm, useMaterialStore } from "../../../../hooks";
import { ComponentInput, ComponentInputSelect, ModalSelectComponent } from "../../../../components";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, Stack, Typography, FormHelperText } from "@mui/material";
import { GroupModal } from "../../Groups";

interface createProps {
    open: boolean;
    handleClose: () => void;
    item: MaterialModel | null;
}

const formMaterialFields: FormMaterialModel = {
    group_id: null,
    code_material: '0',
    description: '',
    unit_material: '',
    barcode: '0',
}

const formMaterialValidation: FormMaterialValidate = {
    group_id: [(value: GroupModel) => value !== null, 'Debe pertenecer a un Grupo'],
    code_material: [(value: string | null) => value !== null, 'Debe ingresar el código correspondiente del material'],
    description: [(value: string | null) => value !== null, 'Debe ingresar la descripción del material'],
    unit_material: [(value: string | null) => value !== null, 'Debe ingresar la unidad del material'],
    barcode: [(value: string | null) => value !== null, 'Debe ingresar el código de barra del material']
}
export const CreateMaterials = (props: createProps) => {
    const { open, handleClose, item } = props;
    const { postMaterial } = useMaterialStore();
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [typeMaterial, setTypeMaterial] = useState("");

    const { group_id, description, unit_material,
        onInputChange, onValueChange, onResetForm,
        group_idValid } = useForm(item ?? formMaterialFields, formMaterialValidation);

    const handleModal = useCallback((value: boolean) => setModal(value), []);

    const sendSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormSubmitted(true);

        const data = {
            group_id: group_id.id,
            code_material: '0', 
            description,
            unit_material,
            barcode: '0',
            stock: 0,
            state: "Inhabilitado",
            min: 5,
            type: typeMaterial,
        };

        setLoading(true);
        if (item == null) {
            await postMaterial(data).then((res) => {
                if (res) {
                    handleClose();
                    onResetForm();
                }
            });
        }
        setLoading(false);
    }

    const units = ["HOJAS", "ROLLO", "BLOCK", "CAJA", "PIEZAS", "OVILLO", "GLOBAL", "PAQUETE", "RESMA"];
    const type_material_select = ["Almacen", "Caja Chica, Fondo en Avance y Reposiciones"];
    units.sort((a, b) => a.localeCompare(b));

    return (
        <>
            {modal && (
                <ModalSelectComponent
                    stateSelect={true}
                    stateMultiple={false}
                    title="Seleccione el grupo del nuevo material"
                    opendrawer={modal}
                    handleDrawer={handleModal}
                >
                    <GroupModal
                        stateSelect={true}
                        limitInit={5}
                        itemSelect={(v) => {
                            onValueChange("group_id", v);
                            handleModal(false);
                        }}
                    />
                </ModalSelectComponent>
            )}
            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.3rem" }}>
                    Crear Nuevo Material
                </DialogTitle>
                <form onSubmit={sendSubmit}>
                    <DialogContent dividers>
                        {/* Selección de Grupo */}
                        <Stack spacing={2} sx={{ mb: 2 }}>
                            <FormControl fullWidth error={!!group_idValid && formSubmitted}>
                                <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>Seleccionar Grupo</Typography>
                                <ComponentInputSelect
                                    label={group_id ? "Grupo Seleccionado" : ''}
                                    title={group_id ? group_id.name_group : "Seleccione un Grupo"}
                                    onPressed={() => handleModal(true)}
                                />
                                {formSubmitted && group_idValid && (
                                    <FormHelperText>{group_idValid}</FormHelperText>
                                )}
                            </FormControl>
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" sx={{ fontWeight: "500", mb: 1 }}>
                            Detalles del Material
                        </Typography>
                        {/* Campos de código de material y código de barra eliminados */}

                        <Stack direction="row" spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo de Material</InputLabel>
                                <Select
                                    label="Tipo de Material"
                                    name="type_material"
                                    value={typeMaterial}
                                    onChange={(event) => setTypeMaterial(event.target.value)}
                                >
                                    {type_material_select.map((type, index) => (
                                        <MenuItem key={index} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Unidad</InputLabel>
                                <Select
                                    label="Unidad"
                                    name="unit_material"
                                    value={unit_material}
                                    onChange={(V: any) => onInputChange(V, false, false)}
                                >
                                    {units.map((unit, index) => (
                                        <MenuItem key={index} value={unit}>{unit}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <Stack spacing={2} sx={{ mt: 2 }}>
                            <ComponentInput
                                type="text"
                                label="Descripción del Material"
                                name="description"
                                value={description}
                                onChange={(V: any) => onInputChange(V, false, false)}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
                        {loading ? (
                            <CircularProgress color="success" size={30} />
                        ) : (
                            <>
                                <Button onClick={handleClose} color="error" variant="contained">
                                    Cancelar
                                </Button>
                                <Button type="submit" color="primary" variant="contained">
                                    {item == null ? "Crear" : "Guardar"}
                                </Button>
                            </>
                        )}
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
};