import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Copy, Check, Upload, X, Download, ArrowRight } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { CardPreview, TwitterPreview, WhatsAppPreview, GooglePreview } from "@/components/previews";
import { Spinner } from "./ui/spinner";
import { Field, FieldContent, FieldDescription, FieldLabel } from "./ui/field";

interface LinkMetadata {
    title: string;
    description: string;
    image: string;
    url: string;
    domain: string;
    favicon: string;
}

const defaultMetadata: LinkMetadata = {
    title: "Link Preview Generator",
    description: "Generate click-worthy link previews for social media and search engines.",
    image: "",
    url: "https://example.com",
    domain: "example.com",
    favicon: "",
};

export function LinkPreviewGenerator() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState<LinkMetadata>(defaultMetadata);
    const [hasFetched, setHasFetched] = useState(false);
    const [customTitle, setCustomTitle] = useState("");
    const [customDescription, setCustomDescription] = useState("");
    const [customImage, setCustomImage] = useState("");
    const [copied, setCopied] = useState(false);
    const [useCorsProxy, setUseCorsProxy] = useState(true);
    const [useServerFetch, setUseServerFetch] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // Use custom values if set, otherwise use fetched metadata
    const displayMetadata = {
        ...metadata,
        title: customTitle || metadata.title,
        description: customDescription || metadata.description,
        image: customImage || metadata.image,
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file");
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setCustomImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearCustomImage = () => {
        setCustomImage("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const generatePreview = async () => {
        if (!url) return;
        setLoading(true);
        try {
            // Use a CORS proxy to fetch the HTML content (if enabled)
            const fetchUrl = useCorsProxy
                ? `https://corsproxy.io/?${encodeURIComponent(url)}`
                : url;

            if (useServerFetch) {
                const serverResponse = await fetch(`https://proxy.fabian-kleine.dev/api/metadata?url=${encodeURIComponent(fetchUrl)}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                });

                if (!serverResponse.ok) {
                    throw new Error(`Server error ${serverResponse.status}: ${serverResponse.statusText}`);
                }

                const serverData = await serverResponse.json();
                setMetadata({
                    title: serverData.title || "",
                    description: serverData.description || "",
                    image: serverData.image || "",
                    url,
                    domain: serverData.domain || new URL(url).hostname,
                    favicon: serverData.favicon || `${new URL(url).origin}/favicon.ico`,
                });
                setHasFetched(true);
                setCustomTitle("");
                setCustomDescription("");
                setCustomImage("");
                return;
            }
            
            const response = await fetch(fetchUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "text/html",
                    "Access-Control-Allow-Origin": "*",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const getMetaContent = (name: string) => {
                return doc.querySelector(`meta[property="${name}"]`)?.getAttribute("content") ||
                    doc.querySelector(`meta[name="${name}"]`)?.getAttribute("content") || "";
            };

            const title = getMetaContent("og:title") || doc.title || "";
            const description = getMetaContent("og:description") || getMetaContent("description") || "";
            const image = getMetaContent("og:image") || "";
            const domain = new URL(url).hostname;

            // Get favicon
            const faviconLink = doc.querySelector('link[rel="icon"]')?.getAttribute("href") ||
                doc.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ||
                doc.querySelector('link[rel*="icon"]')?.getAttribute("href");

            let favicon = "";
            if (faviconLink) {
                // Handle relative URLs
                if (faviconLink.startsWith("http")) {
                    favicon = faviconLink;
                } else if (faviconLink.startsWith("//")) {
                    favicon = `https:${faviconLink}`;
                } else if (faviconLink.startsWith("/")) {
                    favicon = `${new URL(url).origin}${faviconLink}`;
                } else {
                    favicon = `${new URL(url).origin}/${faviconLink}`;
                }
            } else {
                // Fallback to default favicon location
                favicon = `${new URL(url).origin}/favicon.ico`;
            }

            setMetadata({
                title,
                description,
                image,
                url,
                domain,
                favicon
            });

            // Reset custom values when fetching new URL
            setCustomTitle("");
            setCustomDescription("");
            setCustomImage("");
            setHasFetched(true);
        } catch (error) {
            console.error("Failed to fetch link metadata:", error);
            toast.error("Failed to fetch link metadata. Please check the URL and try again.");
            setHasFetched(false);
        } finally {
            setLoading(false);
        }
    };

    const copyMetaTags = () => {
        const metaTags = `<!-- Primary Meta Tags -->
<title>${displayMetadata.title}</title>
<meta name="title" content="${displayMetadata.title}" />
<meta name="description" content="${displayMetadata.description}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${displayMetadata.url}" />
<meta property="og:title" content="${displayMetadata.title}" />
<meta property="og:description" content="${displayMetadata.description}" />
<meta property="og:image" content="${displayMetadata.image}" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${displayMetadata.url}" />
<meta property="twitter:title" content="${displayMetadata.title}" />
<meta property="twitter:description" content="${displayMetadata.description}" />
<meta property="twitter:image" content="${displayMetadata.image}" />`;

        navigator.clipboard.writeText(metaTags);
        setCopied(true);
        toast.success("Meta tags copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadImage = async () => {
        if (!previewRef.current) return;

        setDownloading(true);
        try {
            // Convert external images to data URLs to avoid CORS issues
            const images = previewRef.current.querySelectorAll("img");
            const originalSrcs: { img: HTMLImageElement; src: string }[] = [];

            for (const img of images) {
                if (img.src && img.src.startsWith("http") && !img.src.startsWith(window.location.origin) && !img.src.includes("localhost")) {
                    try {
                        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(img.src)}`;
                        const response = await fetch(proxyUrl);
                        const blob = await response.blob();
                        const dataUrl = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(blob);
                        });
                        originalSrcs.push({ img, src: img.src });
                        img.src = dataUrl;
                    } catch {
                        // If proxy fails, continue without converting
                        console.warn("Could not convert image:", img.src);
                    }
                }
            }

            const dataUrl = await toPng(previewRef.current, {
                pixelRatio: 2,
                cacheBust: true,
            });

            // Restore original image sources
            for (const { img, src } of originalSrcs) {
                img.src = src;
            }

            const link = document.createElement("a");
            link.download = `link-preview-${displayMetadata.domain || "image"}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Image downloaded!");
        } catch (error) {
            console.error("Failed to download image:", error);
            toast.error("Failed to download image. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 font-sans relative overflow-hidden">
            {/* Blurred gradient background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Top left purple/indigo blob */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-full blur-3xl" />
                {/* Top right blue blob */}
                <div className="absolute -top-20 right-0 w-80 h-80 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-3xl" />
                {/* Center purple blob */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-150 h-150 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-3xl" />
                {/* Bottom left magenta/pink blob */}
                <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-fuchsia-500/15 dark:bg-fuchsia-500/20 rounded-full blur-3xl" />
                {/* Bottom right purple blob */}
                <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-purple-500/15 dark:bg-purple-600/25 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">

                {/* Header */}
                <div className="text-center space-y-4">
                    <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="bg-transparent px-3 py-1 h-min text-sm font-medium ring-1 ring-black/10 hover:ring-black/20 dark:ring-white/10 dark:hover:ring-white/20 transition-all"
                        >
                            <a href="https://github.com/Fabian-Kleine/link-preview" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                View on GitHub
                                <ArrowRight />
                            </a>
                        </Button>
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Link preview generator</div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Generate click-worthy link <br className="hidden md:block" /> previews
                    </h1>
                    <p className="max-w-2xl mx-auto text-muted-foreground">
                        Check how your link looks on Google & social platforms. Customize ordinary link previews
                        into eye-catching ones that leave a lasting impression before they're clicked.
                    </p>
                </div>

                {/* content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Left Column: Input */}
                    <Card className="p-6 shadow-sm">
                        <CardHeader className="px-0">
                            <CardTitle className="text-lg font-semibold">URL Details</CardTitle>
                            <CardAction>
                                <ThemeToggle />
                            </CardAction>
                        </CardHeader>
                        <CardContent className="space-y-6 px-0">
                            <Field>
                                <FieldContent>
                                    <FieldLabel htmlFor="url">
                                        Website URL <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <FieldDescription>
                                        Insert your website full URL (e.g https://www.example.com)
                                    </FieldDescription>
                                </FieldContent>
                                <Input
                                    id="url"
                                    placeholder="https://www.example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="h-12"
                                />
                            </Field>

                            <Field orientation="horizontal">
                                <FieldContent>
                                    <FieldLabel htmlFor="cors-proxy">Use CORS Proxy</FieldLabel>
                                    <FieldDescription>Disable if fetching from same origin</FieldDescription>
                                </FieldContent>
                                <Switch
                                    id="cors-proxy"
                                    checked={useCorsProxy}
                                    onCheckedChange={setUseCorsProxy}
                                />
                            </Field>

                            <Field orientation="horizontal">
                                <FieldContent>
                                    <FieldLabel htmlFor="server-fetch">Use Server Fetch</FieldLabel>
                                    <FieldDescription>Enable to fetch metadata via server (avoids CORS issues)</FieldDescription>
                                </FieldContent>
                                <Switch
                                    id="server-fetch"
                                    checked={useServerFetch}
                                    onCheckedChange={setUseServerFetch}
                                />
                            </Field>

                            <Button
                                onClick={generatePreview}
                                disabled={loading}
                                className="w-full text-base font-semibold"
                            >
                                {loading && <Spinner />}
                                Generate Link Preview
                            </Button>

                            {/* Custom Fields - shown after fetching */}
                            {hasFetched && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-sm font-semibold text-muted-foreground">Customize Preview</h3>

                                    <Field>
                                        <FieldContent>
                                            <FieldLabel htmlFor="customTitle">
                                                Custom Title (optional)
                                            </FieldLabel>
                                        </FieldContent>
                                        <Input
                                            id="customTitle"
                                            placeholder={metadata.title}
                                            value={customTitle}
                                            onChange={(e) => setCustomTitle(e.target.value)}
                                        />
                                    </Field>

                                    <Field>
                                        <FieldContent>
                                            <FieldLabel htmlFor="customDescription" className="text-sm font-medium">
                                                Custom Description (optional)
                                            </FieldLabel>
                                        </FieldContent>
                                        <Textarea
                                            id="customDescription"
                                            placeholder={metadata.description}
                                            value={customDescription}
                                            onChange={(e) => setCustomDescription(e.target.value)}
                                            rows={3}
                                        />
                                    </Field>

                                    <Field>
                                        <FieldContent>
                                            <FieldLabel htmlFor="customImage" className="text-sm font-medium">
                                                Custom Image (optional)
                                            </FieldLabel>
                                        </FieldContent>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="customImage"
                                        />
                                        {customImage ? (
                                            <div className="relative">
                                                <img
                                                    src={customImage}
                                                    alt="Custom preview"
                                                    className="w-full h-32 object-cover rounded-lg border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="icon"
                                                    className="absolute top-2 right-2"
                                                    onClick={clearCustomImage}
                                                >
                                                    <X />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="lg"
                                                className="w-full"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload />
                                                Upload Image
                                            </Button>
                                        )}
                                    </Field>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: Output */}
                    <Card className="p-6 shadow-sm min-h-100">
                        <CardHeader className="px-0">
                            <CardTitle className="text-lg font-semibold">Output</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 px-0">
                            <Tabs defaultValue="card" className="w-full">
                                <TabsList className="grid w-full grid-cols-4 mb-6">
                                    <TabsTrigger value="card">Card</TabsTrigger>
                                    <TabsTrigger value="twitter">Twitter</TabsTrigger>
                                    <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                                    <TabsTrigger value="google">Google</TabsTrigger>
                                </TabsList>

                                <div ref={previewRef} className="flex items-center justify-center min-h-75 bg-muted/20 rounded-lg p-4 border border-border">

                                    {/* Default Card Preview */}
                                    <TabsContent value="card" className="w-full max-w-md mt-0">
                                        <CardPreview {...displayMetadata} favicon={metadata.favicon} />
                                    </TabsContent>

                                    {/* Twitter Preview */}
                                    <TabsContent value="twitter" className="w-full max-w-md mt-0">
                                        <TwitterPreview {...displayMetadata} favicon={metadata.favicon} />
                                    </TabsContent>

                                    {/* WhatsApp Preview */}
                                    <TabsContent value="whatsapp" className="w-full max-w-sm mt-0">
                                        <WhatsAppPreview {...displayMetadata} favicon={metadata.favicon} />
                                    </TabsContent>

                                    {/* Google Preview */}
                                    <TabsContent value="google" className="w-full max-w-xl mt-0 px-4">
                                        <GooglePreview {...displayMetadata} favicon={metadata.favicon} />
                                    </TabsContent>

                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <Button
                                        onClick={downloadImage}
                                        disabled={downloading}
                                    >
                                        <Download />
                                        {downloading ? "Downloading..." : "Download Image"}
                                    </Button>
                                    <Button
                                        onClick={copyMetaTags}
                                        variant="outline"
                                    >
                                        {copied ? (
                                            <>
                                                <Check />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy />
                                                Copy Meta Tags
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
