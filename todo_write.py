import json
import sys

def main():
    outcome = {
        "outcome_type": "ACCEPTED_PLAN",
        "target_module": "components/PatternCatalog.tsx",
        "initial_cognitive_complexity_score": 8,
        "hypothesis_summary": "The PatternCatalog component exceeds acceptable cognitive complexity by conflating list rendering, filtering logic, and detailed pattern inspection into a single monolithic structure. By extracting the 'Detail Slide-over' into a separate PatternDetailPanel component, we isolate the inspection logic, thereby reducing cyclomatic complexity of the parent and enforcing better separation of concerns. This aligns with the 'SOFTWARE ARCHITECTURE IS A BIOLOGICAL ORGANISM' metaphor by creating specialized 'organelles' rather than an undifferentiated mass.",
        "ACU_robustness_score": 0.92,
        "tension_metric": {
            "novelty_score": 0.65,
            "grounding_score": 1.0
        },
        "justification_or_plan": "1. Extract Detail Slide-over from PatternCatalog.tsx into PatternDetailPanel.tsx.\n2. Update tailwind config in index.html to use semantic tokens (--primary, --surface, etc.) to comply with Aesthetic Constraints.\n3. Refactor all UI components to use semantic tokens instead of direct colors (e.g. text-white to text-primary).\n4. Update ROADMAP.md to log this Algorithmic Reparation."
    }
    with open('output.json', 'w') as f:
        json.dump(outcome, f, indent=2)
    print("Outcome written to output.json")

if __name__ == "__main__":
    main()
