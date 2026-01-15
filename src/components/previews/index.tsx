import { Link as LinkIcon } from "lucide-react";

export interface PreviewProps {
    title: string;
    description: string;
    image: string;
    url: string;
    domain: string;
    favicon?: string;
}

export function CardPreview({ title, description, image, domain }: PreviewProps) {
    return (
        <div className="rounded-xl overflow-hidden border bg-card text-card-foreground shadow">
            <div className="aspect-[1.91/1] w-full bg-muted relative overflow-hidden flex items-center justify-center">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <LinkIcon className="h-12 w-12 text-muted-foreground opacity-20" />
                )}
            </div>
            <div className="p-4 space-y-2">
                <div className="text-sm font-semibold uppercase text-muted-foreground truncate">{domain}</div>
                <h3 className="font-bold text-lg leading-tight line-clamp-2">{title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
            </div>
        </div>
    );
}

export function TwitterPreview({ title, description, image, domain }: PreviewProps) {
    return (
        <div className="rounded-xl overflow-hidden border bg-black text-white shadow max-w-100 mx-auto">
            <div className="aspect-[1.91/1] w-full bg-gray-800 relative overflow-hidden flex items-center justify-center">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <LinkIcon className="h-12 w-12 text-gray-600" />
                )}
            </div>
            <div className="p-3 bg-black">
                <div className="text-[13px] text-gray-500 uppercase truncate">{domain}</div>
                <h3 className="text-[15px] font-bold leading-tight line-clamp-1 mt-0.5">{title}</h3>
                <p className="text-[14px] text-gray-500 line-clamp-2 mt-1">{description}</p>
            </div>
        </div>
    );
}

export function WhatsAppPreview({ title, description, image, url, domain }: PreviewProps) {
    return (
        <div
            className="bg-[#efeae2] dark:bg-[#0b141a] p-3 rounded-lg max-w-80 mx-auto relative"
            style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABfSURBVHgB7dChAQAgDATBq/5LowI6wCAZJXBzxcy8/cF8dwdoEwUioAoiogqiogoiogoiogoiogoiogoiogoiogoiogoiogoiogoiogoiogoiogoiogoi8t3/yJ3RA4KQW/IAUiAAAAAASUVORK5CYII=")' }}
        >
            {/* Message bubble */}
            <div className="bg-[#d9fdd3] dark:bg-[#005c4b] rounded-lg overflow-hidden shadow-sm max-w-72">
                {/* Link preview card inside bubble */}
                <div className="bg-[#d1f4cc] dark:bg-[#025144] rounded-md m-1 overflow-hidden">
                    {image && (
                        <div className="w-full aspect-[1.91/1] bg-[#cfe9c8] dark:bg-[#0a3d32] overflow-hidden">
                            <img src={image} alt={title} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="p-2">
                        <div className="text-[11px] text-[#667781] dark:text-[#8696a0] uppercase tracking-wide truncate">{domain}</div>
                        <h3 className="font-medium text-[14px] leading-tight text-[#111b21] dark:text-[#e9edef] line-clamp-2 mt-0.5">{title}</h3>
                        {description && (
                            <p className="text-[13px] text-[#667781] dark:text-[#8696a0] line-clamp-2 mt-0.5">{description}</p>
                        )}
                    </div>
                </div>
                {/* URL text */}
                <div className="px-2 pb-1.5 pt-0.5">
                    <a href="#" className="text-[14px] text-[#027eb5] dark:text-[#53bdeb] break-all line-clamp-1">{url}</a>
                </div>
                {/* Timestamp */}
                <div className="flex justify-end items-center gap-1 px-2 pb-1">
                    <span className="text-[11px] text-[#667781] dark:text-[#8696a0]">12:34</span>
                    <svg className="size-4 -translate-y-px text-[#53bdeb]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M7 12l5 5l10 -10" />
                        <path d="M2 12l5 5m5 -5l5 -5" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export function GooglePreview({ title, description, url, domain, favicon }: PreviewProps) {
    return (
        <div className="bg-white dark:bg-[#202124] p-4 rounded-lg w-full">
            <div className="flex items-center gap-3 mb-1">
                <div className="w-7 h-7 shrink-0 bg-gray-100 dark:bg-[#303134] rounded-full flex items-center justify-center overflow-hidden">
                    {favicon ? (
                        <img
                            src={favicon}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                    (e.currentTarget.nextElementSibling as HTMLElement).classList.remove('hidden');
                                }
                            }}
                        />
                    ) : null}
                    <div className={`w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full ${favicon ? 'hidden' : ''}`} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-[#202124] dark:text-[#dadce0] leading-none line-clamp-1">{domain}</span>
                    <span className="text-xs text-[#5f6368] dark:text-[#bdc1c6] mt-0.5 line-clamp-1">{url}</span>
                </div>
            </div>
            <h3 className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer truncate font-normal">
                {title}
            </h3>
            <div className="text-sm text-[#4d5156] dark:text-[#bdc1c6] mt-1 line-clamp-2">
                {description}
            </div>
        </div>
    );
}
