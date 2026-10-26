import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

const TRIE_PY = `class Node:
    def __init__(self):
        self.children = {}
        self.end = False

def insert(root, word):
    node = root
    for c in word:
        if c not in node.children:
            node.children[c] = Node()
        node = node.children[c]
    node.end = True

def find(root, word, prefix=False):
    node = root
    for c in word:
        if c not in node.children:
            return False
        node = node.children[c]
    return prefix or node.end`;

// Keys are the solver's codeLine values: 1 INIT, 2 VISIT (root), 3 VISIT (existing child), 4 CREATE, 5 MARK_END,
// 6 SEARCH_STEP (root), 7 SEARCH_STEP (child), 8 NOT_FOUND (missing child), 9 FOUND / NOT_FOUND (end check), 10 DONE
const PY_LINES: LineMap = {
  1: [[1, 4]], 2: [[6, 7]], 3: [[8, 9], [11, 11]], 4: [[8, 11]], 5: [[12, 12]],
  6: [[14, 15]], 7: [[16, 17], [19, 19]], 8: [[17, 18]], 9: [[20, 20]], 10: [[20, 20]],
};

const TRIE_CPP = `#include <bits/stdc++.h>
using namespace std;

struct Node {
    map<char, Node*> children;
    bool end = false;
};

void insert(Node* root, const string& word) {
    Node* node = root;
    for (char c : word) {
        if (!node->children.count(c))
            node->children[c] = new Node();
        node = node->children[c];
    }
    node->end = true;
}

bool find(Node* root, const string& word, bool prefix = false) {
    Node* node = root;
    for (char c : word) {
        if (!node->children.count(c))
            return false;
        node = node->children[c];
    }
    return prefix || node->end;
}`;

const TRIE_JAVA = `import java.util.*;

class Trie {
    static class Node {
        TreeMap<Character, Node> children = new TreeMap<>();
        boolean end = false;
    }

    static void insert(Node root, String word) {
        Node node = root;
        for (char c : word.toCharArray()) {
            if (!node.children.containsKey(c))
                node.children.put(c, new Node());
            node = node.children.get(c);
        }
        node.end = true;
    }

    static boolean find(Node root, String word, boolean prefix) {
        Node node = root;
        for (char c : word.toCharArray()) {
            if (!node.children.containsKey(c))
                return false;
            node = node.children.get(c);
        }
        return prefix || node.end;
    }
}`;

// C++ and Java share line numbers
const C_LINES: LineMap = {
  1: [[4, 7]], 2: [[9, 10]], 3: [[11, 12], [14, 14]], 4: [[11, 14]], 5: [[16, 16]],
  6: [[19, 20]], 7: [[21, 22], [24, 24]], 8: [[22, 23]], 9: [[26, 26]], 10: [[26, 26]],
};

export default function TrieCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="trie.py"
      code={TRIE_PY}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: TRIE_CPP, isLineHighlighted: highlighter(C_LINES, codeLine) },
        java: { code: TRIE_JAVA, isLineHighlighted: highlighter(C_LINES, codeLine) },
      }}
    />
  );
}
