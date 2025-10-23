import { useDispatch, useSelector } from "react-redux";
import { coffeApi } from "../services";
import { setPettyCash, setProduct, refreshPettyCash, setNotePettyCash, setListGroup, refreshNotePettyCash } from "../store";
import { downloadDocument, printDocument } from "../utils/helper";
import Swal from "sweetalert2";
const api = coffeApi;

export const usePettyCash = () => {
    const { petty_cashes, products, flag } = useSelector((state: any) => state.petty_cashes);
    const { listGroups } = useSelector((state: any) => state.listGroups);
    const { note_petty_cashes } = useSelector((state: any) => state.note_petty_cashes)
    const dispatch = useDispatch();

    const getDataPettyCash = async () => {
        try {
            const { data } = await api.get('/auth/DatesPettyCash')
            dispatch(setPettyCash({ petty_cashes: data }))
        } catch (error: any) {
            if (error.response && error.response.status == 400) {
                const message = error.response.data.error
                Swal.fire('Error', message, 'error')
            } else if (error.response && error.response.status == 403) {
                const message = error.response.data.detail
                Swal.fire('Acceso denegado', message, 'warning')
            } else throw new Error('Ocurrió algun error en el backend')
        }
    }

    const getListGroup = async () => {
        try {
            const { data } = await api.get('/auth/list_group');
            dispatch(setListGroup({ listGroups: data }))
        } catch (error) {
            console.log(error);
        }
    }

    const getNotePettyCashes = async (page: number, limit: number) => {
        try {
            let filter: any = { params: { page: page, limit: limit } };
            const { data } = await api.get('/auth/listPettyNoteCash/', filter);
            dispatch(setNotePettyCash({ note_petty_cashes: data.data }))
            return data.total;
        } catch (error) {
            console.log(error);
        }
    }

    const getNotePettyCashesTicket = async (page: number, limit: number) => {
        try {
            let filter: any = { params: { page: page, limit: limit } };
            const { data } = await api.get('/auth/listPettyNoteCash/', filter);
            dispatch(setNotePettyCash({ note_petty_cashes: data.data }))
            return data.total;
        } catch (error) {
            console.log(error);
        }
    }

    const printNoteFormVale = async (note: any) => {
        try {
            const noteId = note.id_note || note.id;
            const response = await api.get(`/auth/printPettCash/${noteId}/`, {
                responseType: 'arraybuffer',
            });
            printDocument(response)
            return true

        } catch (error) {
            console.error('Error al imprimir la nota de entrada:', error);
        }
    }

    const printNoteFormDischarge = async (note: any) => {
        try {
            const noteId = note.id_note || note.id;
            const response = await api.get(`/auth/printPettCashDischarge/${noteId}/`, {
                responseType: 'arraybuffer',
            });
            printDocument(response)
            return true

        } catch (error) {
            console.error('Error al imprimir la nota de entrada:', error);
        }
    }

    const postDeliveyOfResources = async (note: any) => {
        try {
            const response = await api.post('/auth/postDeliveyOfResources/', note);
            if (response.data.status) {
                dispatch(refreshNotePettyCash());
                Swal.fire('Se entrego el monto de:', response.data.message, 'success');
            } else {
                Swal.fire('Error', response.data.message, 'error');
            }
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            Swal.fire('Error', 'Ocurrió un error al procesar la solicitud', 'error');
            return false;
        }
    }

    const postReloadNotePettyCashes = async (note: any) => {
        try {
             const updatedNote = { ...note, type: false };

            const response = await api.post('/auth/request_cancellation/', updatedNote);
            if (response.data.status) {
                dispatch(refreshNotePettyCash());
                Swal.fire('Se acaba de anular la solicitud', response.data.message, 'success');
            } else {
                Swal.fire('Error', response.data.message, 'error');
            }
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            Swal.fire('Error', 'Ocurrió un error al procesar la solicitud', 'error');
            return false;
        }
    }

    const getProductsData = async () => {
        try {
            const { data } = await api.get('/auth/printAccountabilitySheet')
            dispatch(setProduct({ products: data }))
        } catch (error: any) {
            if (error.response && error.response.status == 400) {
                const message = error.response.data.error
                Swal.fire('Error', message, 'error')
            } else if (error.response && error.response.status == 403) {
                const message = error.response.data.detail
                Swal.fire('Acceso denegado', message, 'warning')
            } else throw new Error('Ocurrió algun error en el backend')
        }
    }

    const PrintDiaryBook = async (action: string, id: any) => {
        const params = new URLSearchParams({
            idFund: id.toString(),
        });
        if (action == 'libroDiario') {
            try {
                const response = await api.get(`/auth/PrintRecordBook?${params.toString()}`, {
                    responseType: 'arraybuffer'
                });
                printDocument(response);
                return true;
            } catch (error) {
                console.error('Error al imprimir la nota ', error);
            }
        } else {
            try {
                const response = await api.get(`/auth/AccountabilitySheet?${params.toString()}`, {
                    responseType: 'arraybuffer'
                });
                printDocument(response);
                return true;
            } catch (error) {
                console.error('Error al imprimir la nota ', error);
            }
        }
    }

    const DownloadDiaryBook = async (action: string, id: any) => {
        console.log(id);
        if (action == 'libroDiario') {
            try {
                const response = await api.get(`/auth/PrintRecordBook/`, {
                    responseType: 'arraybuffer'
                });
                downloadDocument(response, 'Libro_Diario.pdf');
                return true;
            } catch (error) {
                console.error('Error al imprimir la nota ', error);
            }
        } else {
            try {
                const response = await api.get(`/auth/AccountabilitySheet/`, {
                    responseType: 'arraybuffer'
                });
                downloadDocument(response, 'Planilla_de_Descargos.pdf');
                return true;
            } catch (error) {
                console.error('Error al imprimir la nota ', error);
            }
        }
    }

    const PaymentOrder = async (total: number, responsible: string) => {
        try {
            const params = new URLSearchParams({
                total: total.toString(),
                responsible,
            });


            const response = await api.get(`/auth/paymentOrder?${params.toString()}`, {
                responseType: 'arraybuffer'
            });
            Swal.fire('Éxito', 'Orden de pago enviada correctamente', 'success');
            downloadDocument(response, 'Orden_de_pago.pdf');
            return true;
        } catch (error: any) {
            if (error.response && error.response.status == 400) {
                const message = error.response.data.error;
                Swal.fire('Error', message, 'error');
            } else if (error.response && error.response.status == 403) {
                const message = error.response.data.detail;
                Swal.fire('Acceso denegado', message, 'warning');
            } else {
                console.error('Error al enviar la orden de pago:', error);
                throw new Error('Ocurrió algún error en el backend');
            }
        }
    }

    const sendGroupProduct = async (body: object) => {
        try {
            const response = await api.post('/auth/sendGroup/', body);
            if (response.data.status) {
                dispatch(refreshNotePettyCash());
                Swal.fire('Estado de la Solicitud', response.data.message, 'success');
            } else {
                Swal.fire('Error', response.data.message, 'error');
            }
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            Swal.fire('Error', 'Ocurrió un error al procesar la solicitud', 'error');
            return false;
        }
    }

    const CreateDischarge = async (balance: any, responsable: string, username: string) => {
        try {
            const params = new URLSearchParams({
                balance: balance.toString(),
                responsable,
                username,
            });
            await api.get(`/auth/createDischarge?${params.toString()}`);
            dispatch(refreshPettyCash());
            Swal.fire('Gescargo Exitoso', '', 'success');
            return true;
        } catch (error: any) {
            if (error.response) {
                if (error.response.status === 403) {
                    const message = error.response.data.detail || 'Acceso denegado';
                    Swal.fire('Acceso denegado', message, 'warning');
                } else {
                    const message = error.response.data.error || 'Error desconocido';
                    Swal.fire('Error', message, 'error');
                }
            } else {
                Swal.fire('Error', 'Ocurrió un error inesperado', 'error');
            }
            return false;
        }
    }

    return {
        note_petty_cashes,
        petty_cashes,
        flag,
        products,
        listGroups,

        getDataPettyCash,
        getProductsData,
        PrintDiaryBook,
        DownloadDiaryBook,
        PaymentOrder,
        CreateDischarge,
        getNotePettyCashes,
        getListGroup,
        sendGroupProduct,
        postDeliveyOfResources,
        printNoteFormDischarge,
        printNoteFormVale,
        postReloadNotePettyCashes,
        getNotePettyCashesTicket,
    }
}