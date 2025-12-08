import PostalMime from 'postal-mime';

function humanFileSize(size) {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return parseFloat((size / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

export async function processItem(item) {
    try {
        const parsedEmail = await PostalMime.parse(item.raw);
        item.source = parsedEmail.from.address || item.source;
        if (parsedEmail.from.address && parsedEmail.from.name) {
            item.source = `${parsedEmail.from.name} <${parsedEmail.from.address}>`;
        }
        item.subject = parsedEmail.subject || 'No Subject';
        item.message = parsedEmail.html || parsedEmail.text || item.raw;
        item.text = parsedEmail.text || '';
        item.attachments = parsedEmail.attachments?.map((a_item) => {
            const blob = new Blob(
                [a_item.content],
                { type: a_item.mimeType || 'application/octet-stream' }
            );
            const blob_url = URL.createObjectURL(blob)
            if (a_item.contentId && a_item.contentId.length > 0) {
                item.message = item.message.replace(`cid:${a_item.contentId}`, blob_url);
            }
            return {
                id: a_item.contentId || Math.random().toString(36).substring(2, 15),
                filename: a_item.filename || a_item.contentId || "",
                size: humanFileSize(a_item.content?.length || 0),
                url: blob_url,
                blob: blob
            }
        }) || [];
    } catch (error) {
        console.log('Error parsing email with PostalMime');
        console.error(error);
        item.subject = 'No Subject';
        item.message = item.raw;
    }
    return item;
}

export function getDownloadEmlUrl(raw) {
    return URL.createObjectURL(
        new Blob([raw], { type: 'text/plain' }
        ))
}
