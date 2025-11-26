
export default function ErrorHandler(error) {

    console.log("ERROR LOG", error)

    if (error instanceof Error) {
        return {
            success: false,
            message: error.message
        }
    }

    return {
        success: false,
        message: "Unexpected Error Occurred"
    }
}