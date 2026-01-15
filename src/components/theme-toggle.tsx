import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("light")

    useEffect(() => {
        const isDark = document.documentElement.classList.contains("dark")
        setTheme(isDark ? "dark" : "light")
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light"
        setTheme(newTheme)
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }

    return (
        <Button variant="outline" size="icon" onClick={toggleTheme}>
            <div className="flex justify-center items-center relative h-[1.2rem] w-[1.2rem] transition-all">
                <Sun className={`absolute h-full w-full rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0`} />
                <Moon className={`absolute h-full w-full rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`} />
            </div>
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
