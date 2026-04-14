import re

with open('src/pages/AlgorithmPage.tsx', 'r') as f:
    code = f.read()

# Define a function to process each algorithm's return block
def process_return_block(block):
    # Regex to extract the Header
    header_match = re.search(r'\{\/\*\s*Header\s*\*\/\}\s*(<div className="p-3.*?</div>\s*)(?:\{mode|{/*)', block, re.DOTALL)
    if not header_match:
        return block
    header = header_match.group(1).strip()
    
    # Try to extract the banner. Note: not all algos have modes. Some might just have banner directly.
    # Usually it's inside `{mode === 'example' ?`
    # Let's find stepController
    step_ctrl_match = re.search(r'(<StepController\s+[^>]*/>)', block)
    
    # Let's see if RightPanel exists
    right_panel_match = re.search(r'(<RightPanel>.*?</RightPanel>)', block, re.DOTALL)
    if not right_panel_match:
        return block # skip if no right panel
        
    rp = right_panel_match.group(1)
    
    return block

print("Ready")
