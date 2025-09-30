import printJS from "print-js";

// Función para imprimir el documento
export const printDocument = (res: any) => {
    const contentType = res.headers['content-type'];
    if (contentType !== 'application/pdf' && contentType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return;
    }

    const blob = new Blob([res.data], {
        type: contentType
    });

    const fileURL = window.URL.createObjectURL(blob);

    // Si es PDF, usa printJS para imprimir, si es Excel usa una descarga directa
    if (contentType === 'application/pdf') {
        printJS(fileURL);
    } else if (contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = 'report_kardex.xlsx';  // Puedes personalizar el nombre
        link.click();
    }
};

// Función para descargar el documento (tanto PDF como Excel)
export const downloadDocument = (res: any, filename: string) => {
    const contentType = res.headers['content-type'];

    let blob;
    if (contentType === 'application/pdf') {
        blob = new Blob([res.data], { type: 'application/pdf' });
    } else if (contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } else {
        return; 
    }

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
};
