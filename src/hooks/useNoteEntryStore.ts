import { useDispatch, useSelector } from "react-redux"
import { setShoppingCart, setNoteEntry, refreshNoteEntry, setNoteEntryRevision } from "../store";
import { coffeApi } from "../services";
import Swal from "sweetalert2";
import { NoteEntryModel } from "../models";
import { DialogComponent } from "../components";
import { printDocument } from "../utils/helper";

const api = coffeApi;

export const useNoteEntryStore = () => {
    const { note_entries = [], note_entrie_revisions = [], flag, shoppingCart = [] } = useSelector((state: any) => state.note_entries);
    const dispatch = useDispatch();


    const setUpdateShoppingCart = async (items: any) => {
        dispatch(setShoppingCart({ shoppingCart: items }))
    }

    const getNoteEntry = async (page: number, limit: number, search: string, startDate?: string, endDate?: string) => {
        let filter: any = {
            params: {
                page: page,
                limit: limit,
            },
        };

        if (search !== '') filter.params.search = search;
        if (startDate) filter.params.start_date = startDate;
        if (endDate) filter.params.end_date = endDate;
        
        const { data } = await api.get('/auth/notes/', filter);
        dispatch(setNoteEntry({ note_entries: data.data }));

        return data.total;
    };


    const getNoteEntryRevision = async (page: number, limit: number, search: string, startDate?: string, endDate?: string) => {
        let filter: any = { params: { page: page } };
        if (limit != -1) filter.params.limit = limit;
        if (search !== '') filter.params.search = search;
        if (startDate !== '') filter.params.start_date = startDate;
        if (endDate !== '') filter.params.end_date = endDate;
        const { data } = await api.get('/auth/notesRevision/', filter);
        dispatch(setNoteEntryRevision({ note_entrie_revisions: data.data }));
        return data.total;
    };

    const postNoteEntryApproved = async (body: object) => {
        try {
            const { data } = await api.post('/auth/approvedNoteEntry/', body);
            dispatch(refreshNoteEntry());
            Swal.fire('Nota de Entrada Aceptada Correctamente !!! ', '', 'success');
            return data;
        } catch (error: any) {
            if (error.response && error.response.status == 403) {
                const message = error.response;
                Swal.fire('Acceso Denegado', message, 'warning')
            } else {
                const message = error.response.data.error
                Swal.fire('Error', message, 'error');
            }

            return false;
        }

    }


    const postNoteEntry = async (body: object) => {
        try {
            const { data } = await api.post('/auth/createNoteEntry/', body);
            dispatch(refreshNoteEntry());
            Swal.fire('Nota de Entrada Creada Correctamente !!! ', '', 'success');
            return data;
        } catch (error: any) {
            if (error.response && error.response.status == 403) {
                const message = error.response;
                Swal.fire('Acceso Denegado', message, 'warning')
            } else {
                const message = error.response.data.error
                Swal.fire('Error', message, 'error');
            }

            return false;
        }

    }

    const deleteNoteEntry = async (note_entry: NoteEntryModel) => {
        const { dialogDelete } = DialogComponent();
        const state = await dialogDelete(`Se eliminara la nota de entrada ${note_entry.invoice_number}`);
        if (state) {
            await api.delete(`/auth/deleteNoteEntry/${note_entry.id}/`);
            dispatch(refreshNoteEntry());
            Swal.fire('¡Eliminado!', `${note_entry.id} con codigo de autorizacion`, 'success');
        }
    }


    const PrintNoteEntry = async (note_entry: any) => {
        try {
            const response = await api.get(`/auth/printNoteEntry/${note_entry.id}/`, {
                responseType: 'arraybuffer',
            });
            printDocument(response)
            return true

        } catch (error) {
            console.error('Error al imprimir la nota de entrada:', error);
        }
    };

    return {
        note_entries,
        flag,
        shoppingCart,
        note_entrie_revisions,

        setUpdateShoppingCart,
        postNoteEntry,
        getNoteEntry,
        deleteNoteEntry,
        PrintNoteEntry,
        getNoteEntryRevision,
        postNoteEntryApproved,
    }
}