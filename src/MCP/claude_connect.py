from mcp.server.fastmcp import FastMCP

mcp = FastMCP("demo")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers together."""
    return a + b

@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Greet the user by name."""
    return f"Hello, {name}!"

@mcp.prompt()
def greet_user(name: str,style: str="friendly") -> str:
    """Prompt the user for their name and greet them."""
    styles = {
        "friendly": f"Hello, {name}! It's great to see you!",
        "formal": f"Good day, {name}. How are you doing?"
    }
  
    greeting = get_greeting(name)
    return f"style: {style.get(styles, 'friendly')}\n{greeting}"